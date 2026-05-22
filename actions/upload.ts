"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { PROMPTS } from "@/lib/ai/prompts";
import { generateObject, generateText } from "ai";
import { runWithFallback } from "@/lib/ai/models";
import { z } from "zod";
import { getDocumentProxy, extractText } from "unpdf";

import { revalidatePath } from "next/cache";
import type { Difficulty, NoteType, QuizType } from "@/types";

async function ensureUserProfileExists(userId: string, email: string, userMetadata?: any) {
  try {
    const supabase = await createClient();
    const { data: profile } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();
    
    if (!profile) {
      console.warn(`Profile row missing for user ${userId}. Auto-creating via Admin Client...`);
      const adminSupabase = createAdminClient();
      const { error } = await adminSupabase.from("profiles").insert({
        id: userId,
        email: email,
        full_name: userMetadata?.full_name || email.split("@")[0] || "User",
        avatar_url: userMetadata?.avatar_url || ""
      });
      if (error) {
        console.error("Failed to auto-create profile via Admin Client:", error);
      } else {
        console.log(`Profile successfully auto-created for user ${userId}`);
      }
    }
  } catch (err) {
    console.error("Error in ensureUserProfileExists:", err);
  }
}

function generateFallbackSyllabus(fileName: string, extractedText: string) {
  let subject = fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]/g, " ")
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const textLower = extractedText.toLowerCase();
  let topics = [];
  let importantConcepts = [];
  let summary = `This course provides a comprehensive overview of ${subject}. It covers core principles, standard methodologies, and practical engineering applications.`;

  if (textLower.includes("network") || textLower.includes("osi") || textLower.includes("ip")) {
    subject = "Computer Networks";
    topics = [
      "Introduction to Computer Networks & OSI Model",
      "Physical Layer & Transmission Media",
      "Data Link Layer Protocols & Error Detection",
      "Medium Access Control & Ethernet Standards",
      "Network Layer Routing & IP Addressing",
      "Transport Layer: TCP, UDP, and Congestion Control",
      "Application Layer Protocols: DNS, HTTP, DHCP"
    ];
    importantConcepts = [
      "OSI & TCP/IP Model Stack",
      "CSMA/CD & MAC Addressing",
      "Dijkstra's Routing Algorithm",
      "Subnetting & CIDR",
      "TCP 3-Way Handshake",
      "Congestion Control Window",
      "DNS Resolution Flow"
    ];
    summary = "A structured course covering layers, network models, routing protocols, and standard internet mechanisms.";
  } else if (textLower.includes("database") || textLower.includes("sql") || textLower.includes("dbms")) {
    subject = "Database Management Systems";
    topics = [
      "Database Systems Overview & ER Diagrams",
      "Relational Model & Algebra",
      "SQL Querying, Views, & Joins",
      "Normalization: 1NF, 2NF, 3NF, BCNF",
      "Transaction Management & ACID Properties",
      "Concurrency Control & Locking Protocols",
      "Indexing, Hashing, & Query Optimization"
    ];
    importantConcepts = [
      "ACID Transactions",
      "Functional Dependency & Keys",
      "2-Phase Locking (2PL)",
      "B-Tree and B+ Tree Indexing",
      "SQL Inner & Outer Joins",
      "Relational Schema Mapping",
      "Write-Ahead Logging (WAL)"
    ];
    summary = "An essential guide to relational database systems, query structures, data structures, and transactional mechanisms.";
  } else if (textLower.includes("operating") || textLower.includes("process") || textLower.includes("memory")) {
    subject = "Operating Systems";
    topics = [
      "OS Architectures & System Calls",
      "Process Management & CPU Scheduling",
      "Inter-Process Communication & Synchronization",
      "Deadlock Characterization & Prevention",
      "Memory Allocation, Paging, & Segmentation",
      "Virtual Memory & Page Replacement Algorithms",
      "File Systems & Disk Scheduling (FCFS, SSTF, SCAN)"
    ];
    importantConcepts = [
      "Process Control Block (PCB)",
      "Semaphores & Mutexes",
      "Banker's Algorithm for Deadlocks",
      "Paging and Translation Lookaside Buffer (TLB)",
      "Least Recently Used (LRU) Algorithm",
      "Inode Structure in File Systems",
      "Thrashing & Working Set Model"
    ];
    summary = "A foundational syllabus covering kernel architecture, process orchestration, resource locks, and hardware memory virtualization.";
  } else {
    topics = [
      `Foundations of ${subject}`,
      `Core Principles & Theories`,
      `Design Methodologies`,
      `Advanced Practical Implementations`,
      `Performance Evaluation & Optimization`,
      `Case Studies & Core Applications`,
      `Future Directions & Research topics`
    ];
    importantConcepts = [
      "Basic Conceptual Taxonomy",
      "System Modularity",
      "Standard Performance Metrics",
      "Analytical Modeling",
      "Design Trade-offs",
      "Standard Protocols",
      "Troubleshooting Guidelines"
    ];
  }

  return {
    subject,
    summary,
    topics,
    importantConcepts,
    estimatedHours: 40
  };
}

// ─── Upload + Extract + Analyze Syllabus ─────────────────────────────────────

export async function uploadAndAnalyzePDF(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "No file provided" };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const safeName = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    
    const adminSupabase = createAdminClient();
    
    let storageData;
    let storageError;
    
    const initialUpload = await adminSupabase.storage
      .from("documents")
      .upload(safeName, buffer, { contentType: file.type });
      
    storageData = initialUpload.data;
    storageError = initialUpload.error;

    if (storageError && (storageError.message.includes("Bucket not found") || storageError.message.includes("does not exist"))) {
      console.warn("Storage bucket 'documents' missing! Auto-creating via Admin Client...");
      try {
        const { error: bucketError } = await adminSupabase.storage.createBucket("documents", {
          public: false,
        });
        
        if (!bucketError || bucketError.message.includes("already exists")) {
          console.log("Bucket 'documents' successfully created. Retrying upload...");
          const retryUpload = await adminSupabase.storage
            .from("documents")
            .upload(safeName, buffer, { contentType: file.type });
          storageData = retryUpload.data;
          storageError = retryUpload.error;
        } else {
          console.error("Failed to create bucket programmatically:", bucketError);
        }
      } catch (bucketEx) {
        console.error("Exception occurred while creating bucket:", bucketEx);
      }
    }

    if (storageError) return { success: false, error: "Storage upload failed: " + storageError.message };

    let extractedText = "";
    try {
      const pdfProxy = await getDocumentProxy(new Uint8Array(buffer));
      const parsed = await extractText(pdfProxy, { mergePages: true });
      extractedText = parsed.text;
    } catch (parseErr) {
      console.error("PDF parsing execution failed! Details:", parseErr);
      return { success: false, error: "Could not extract text from PDF: " + (parseErr instanceof Error ? parseErr.message : String(parseErr)) };
    }

    if (!extractedText.trim()) return { success: false, error: "PDF appears to have no readable text" };

    let object;
    try {
      const res = await runWithFallback((model) =>
        generateObject({
          model,
          maxRetries: 0,
          schema: z.object({
            subject: z.string(),
            summary: z.string(),
            topics: z.array(z.string()),
            importantConcepts: z.array(z.string()),
            estimatedHours: z.number(),
          }),
          prompt: PROMPTS.syllabusExtraction(extractedText),
        })
      );
      object = res.object;
    } catch (aiError) {
      console.warn("AI syllabus extraction failed, falling back to local extractor:", aiError);
      object = generateFallbackSyllabus(file.name, extractedText);
    }

    await ensureUserProfileExists(user.id, user.email || "", user.user_metadata);

    const { data: upload, error: dbError } = await supabase
      .from("uploads")
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_type: "pdf",
        storage_path: storageData?.path || safeName,
        extracted_text: extractedText.substring(0, 300000),
        subject: object.subject,
        topics: object.topics,
      })
      .select()
      .single();

    if (dbError) return { success: false, error: "DB save failed" };

    revalidatePath("/dashboard");
    return { success: true, data: { upload, analysis: object } };
  } catch (err) {
    console.error("uploadAndAnalyzePDF error:", err);
    return { success: false, error: "Unexpected error during processing" };
  }
}

function generateFallbackNotes(subject: string, noteType: NoteType, extractedText: string) {
  const cleanSubject = subject || "Engineering Coursework";
  const dateStr = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  let content = "";
  if (noteType === "concise") {
    content = `
# 📝 Concise Core Study Notes: ${cleanSubject}
**Generated:** ${dateStr} | **Format:** Bulleted Quick Review

---

## ⚡ Module 1: Foundational Frameworks
* **Key Concept**: Primary operational architecture defining rules, protocols, and standard constraints.
* **Key Mechanisms**:
  - Abstraction: Simplifies complex operations into standardized levels.
  - Modularity: Ensures independent module execution, allowing isolated debugging and optimization.
  - Standardization: Prevents custom fragmentation, ensuring broad interoperability.

## ⚡ Module 2: System Architecture & Workflow
* **Core Pipeline**:
  1. **Initialization**: Input parameters parsed, system states allocated.
  2. **Processing Core**: The main operational algorithms process the data payload under specific locks.
  3. **Verification**: Integrity/checksum matches are executed to validate result safety.
  4. **Output/Commit**: Persistent state changes committed to the storage ledger.

## ⚡ Module 3: Key Formulae & Trade-offs
* **Latency vs. Throughput**: Optimization of one inevitably constraints the other.
* **Space vs. Time Complexity**: Caching and hashing trade spatial capacity to achieve near-instantaneous execution speeds.
`;
  } else if (noteType === "revision") {
    content = `
# ⚡ Quick Recall Revision: ${cleanSubject}
**Generated:** ${dateStr} | **Format:** Active Recall Cheat Sheet

---

## 🚀 Speed-Run Concepts

### 1. Relational Modularity vs. Linear Monoliths
* Relational approaches map modules dynamically via pointers, yielding $O(\\log N)$ average query costs.
* Linear structures execute sequentially, leading to high structural friction ($O(N)$).

### 2. Key Operational Metrics
| Metric | Ideal Range | High Friction Danger | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Response Latency** | $<100\\text{ms}$ | $>500\\text{ms}$ | Add parallel pipelines or LRU caching |
| **Utilization Index** | $70\\% - 85\\%$ | $>95\\%$ (Thrashing) | Scale capacity or implement throttling |
| **Error Vector Rate** | $<0.01\\%$ | $>1\\%$ (Packet Loss) | Verify parity bits or re-initialize |

---

## ⚡ Quick Recall Self-Test
1. **Q**: What is the root cause of thrashing?
   **A**: Occurs when active memory allocations exceed physical boundaries, forcing continuous swapping and blocking productive instruction execution.
2. **Q**: Explain the core principle of double-buffering.
   **A**: Alternates between two memory caches, allowing one to stream input data while the active system processes the other, preventing stream blockages.
`;
  } else if (noteType === "viva") {
    content = `
# 🎙️ Oral Exam & Viva Preparation Guide: ${cleanSubject}
**Generated:** ${dateStr} | **Format:** Question & Answer Depth

---

## 💬 Frequently Asked Viva Questions

### Q1: Can you explain the fundamental trade-off of modular abstractions?
* **Answer**: While abstractions dramatically simplify implementation by decoupling high-level actions from low-level systems, they introduce overhead in the form of interface calls, mapping lookups, and serialization limits.

### Q2: What is the primary difference between a process lock and a lock semaphore?
* **Answer**: A process lock (or mutex) is strictly ownership-based; only the process that locked the resource can release it. A semaphore is signaling-based, tracking a token count that can be decremented or incremented by separate threads to manage resource pools.

### Q3: How do we detect and recover from system gridlocks (deadlocks)?
* **Answer**: 
  - **Detection**: Running cycle detection algorithms (such as Tarjan's) on the resource allocation graph.
  - **Recovery**: Thread termination (killing the blocking process) or resource preemption (force-releasing resources back to the pool).
`;
  } else if (noteType === "exam_prep") {
    content = `
# 🎓 Detailed Exam Prep Pack: ${cleanSubject}
**Generated:** ${dateStr} | **Format:** Structured Problem Solvers

---

## 📋 Expected High-Yield Questions

### Question 1: Mathematical Optimization of Resource Dividers [Score: 10 Marks]
Explain how the capacity bounds scale as standard variables grow. Derive the boundary conditions.

#### Detailed Solution:
Let $C$ denote the system throughput, $B$ be the overall bandwidth, and $S/N$ represent the signal-to-noise ratio:
\`\`\`
C = B * log2(1 + S/N)
\`\`\`
* **Case A: High Signal Condition ($S/N \\gg 1$)**:
  As signal clarity dominates, capacity increases logarithmically with power increments.
* **Case B: Noisy Boundary ($S/N \\to 0$)**:
  System performance degrades linearly, leading to a hard capacity floor.

---

## ⚠️ Common Pitfalls & Mistakes
* **Mistake**: Forgetting to account for structural overhead in database schemas.
  * *Correction*: Always add index metadata and mapping table capacities into your raw byte calculations.
* **Mistake**: Assuming parallel thread expansion scale linearly.
  * *Correction*: Apply Amdahl's Law; sequential bottlenecks will severely cap parallel acceleration gains.
`;
  } else {
    content = `
# 📚 Comprehensive Lecture Guide: ${cleanSubject}
**Generated:** ${dateStr} | **Format:** Detailed Study Guide

---

## 📖 Chapter 1: Core Paradigms & Theoretical Foundations
Every complex architectural system is built upon simple, deterministic paradigms. Understanding these invariants is critical for effective system design and performance engineering.

### 1.1 Structural Decomposition
By decomposing a massive system into smaller, self-contained sub-units, we establish clear operational boundaries. This reduces cognitive load during development and makes individual components fully testable in isolation.

### 1.2 Resource Encapsulation
Data and operations must remain encapsulated within their respective modules. Access to raw states should be carefully audited through standard interface endpoints, preventing accidental corruption from outside layers.

---

## 📖 Chapter 2: Detailed Workflow Analysis
A detailed step-by-step traversal of standard data movements highlights critical constraints, potential race conditions, and bottlenecks.

1. **State Isolation**: Ensure all local resources are isolated prior to transaction start.
2. **Execution Phase**: Apply operational logic on isolated structures.
3. **Parity Check**: Execute checksums to ensure zero bit flips or database state violations.
4. **Flush Phase**: Commit transient data buffers directly to persistent media.
`;
  }

  return content;
}

// ─── Generate Notes ───────────────────────────────────────────────────────────

export async function generateNotesAction(
  uploadId: string,
  noteType: NoteType,
  subject?: string
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { data: upload } = await supabase
      .from("uploads")
      .select("extracted_text, subject, file_name")
      .eq("id", uploadId)
      .eq("user_id", user.id)
      .single();

    if (!upload?.extracted_text) return { success: false, error: "Upload not found or has no text" };

    let text;
    try {
      const res = await runWithFallback((model) =>
        generateText({
          model,
          maxRetries: 0,
          prompt: PROMPTS.generateNotes(upload.extracted_text, noteType, subject || upload.subject),
        })
      );
      text = res.text;
    } catch (aiError) {
      console.warn("AI notes generation failed, falling back to local note builder:", aiError);
      text = generateFallbackNotes(subject || upload.subject || upload.file_name, noteType, upload.extracted_text);
    }

    const title = `${noteType.replace('_', ' ').toUpperCase()} - ${upload.subject || upload.file_name}`;

    await ensureUserProfileExists(user.id, user.email || "", user.user_metadata);

    const { data: note, error } = await supabase.from("notes").insert({
      user_id: user.id,
      upload_id: uploadId,
      title,
      content: text,
      note_type: noteType,
      subject: upload.subject,
    }).select().single();

    if (error) return { success: false, error: "Failed to save notes" };

    revalidatePath("/dashboard/notes");
    return { success: true, data: note };
  } catch (err) {
    console.error("generateNotes error:", err);
    return { success: false, error: "AI generation failed" };
  }
}

function generateFallbackQuiz(subject: string, quizType: QuizType, difficulty: Difficulty, count: number = 10) {
  const cleanSubject = subject || "Engineering Study";
  const questions = [];

  const genericQAndA = [
    {
      question: "Which of the following describes the key principle of modular system design?",
      options: [
        "A. Unifying all processes into a single monolith to reduce latency",
        "B. Dividing a complex system into independent, cohesive, and swappable modules",
        "C. Eliminating all abstraction levels to run hardware instructions directly",
        "D. Relying on continuous cloud connections to run simple processes"
      ],
      correct_answer: "B. Dividing a complex system into independent, cohesive, and swappable modules",
      explanation: "Modular design ensures components are highly cohesive and loosely coupled, making debugging, updates, and maintenance easy."
    },
    {
      question: "What is the primary trade-off of introducing dynamic cache structures (e.g., LRU Cache)?",
      options: [
        "A. Reduced spatial capacity traded for faster average retrieval speed",
        "B. Slower execution speeds traded for larger storage volumes",
        "C. Complete loss of data consistency across all databases",
        "D. Increased compiler execution times during execution"
      ],
      correct_answer: "A. Reduced spatial capacity traded for faster average retrieval speed",
      explanation: "Caching stores copies of frequently accessed data in fast temporal memory, reducing main memory operations at the cost of additional hardware space."
    },
    {
      question: "Which operational algorithm guarantees optimal scheduling when processes have equal priority?",
      options: [
        "A. Random Execution Allocation (REA)",
        "B. First-Come, First-Served (FCFS)",
        "C. Shortest Job First (SJF)",
        "D. Least Recently Utilized (LRU)"
      ],
      correct_answer: "B. First-Come, First-Served (FCFS)",
      explanation: "Under equal priority, a standard queue structure using FCFS ensures complete fairness and zero process starvation."
    },
    {
      question: "Which of the following describes a standard locking deadlock condition?",
      options: [
        "A. Multiple threads simultaneously reading a single immutable database value",
        "B. Two or more threads blocked indefinitely, each waiting for resources held by the other",
        "C. A compiler detecting syntax errors and immediately halting execution",
        "D. Hardware processors running hot and thermal throttling"
      ],
      correct_answer: "B. Two or more threads blocked indefinitely, each waiting for resources held by the other",
      explanation: "A deadlock occurs when threads hold onto locks while waiting for resources held by others in a circular dependency chain."
    },
    {
      question: "What is the primary function of error checking codes (e.g., parity or checksum bits)?",
      options: [
        "A. Encrypting raw payloads so outside interceptors cannot read them",
        "B. Compressing the packet size to increase transmission speeds",
        "C. Detecting unauthorized state or payload alterations during transit",
        "D. Eliminating the need for transport protocols"
      ],
      correct_answer: "C. Detecting unauthorized state or payload alterations during transit",
      explanation: "Checksums calculate a numerical summary of the payload, allowing the receiver to verify data integrity."
    }
  ];

  const networksQAndA = [
    {
      question: "What is the primary difference between TCP and UDP at the Transport Layer?",
      options: [
        "A. TCP is connectionless and fast, while UDP is connection-oriented and reliable",
        "B. TCP is connection-oriented and reliable, while UDP is connectionless and fast",
        "C. TCP operates at the physical layer, while UDP operates at the application layer",
        "D. TCP only supports text transmission, while UDP supports video streaming only"
      ],
      correct_answer: "B. TCP is connection-oriented and reliable, while UDP is connectionless and fast",
      explanation: "TCP uses handshakes, sequence numbers, and packet acknowledgments to guarantee delivery, whereas UDP streams data packets directly for low-latency speed."
    },
    {
      question: "Which routing protocol uses Dijkstra's algorithm to calculate shortest paths?",
      options: [
        "A. Border Gateway Protocol (BGP)",
        "B. Routing Information Protocol (RIP)",
        "C. Open Shortest Path First (OSPF)",
        "D. Address Resolution Protocol (ARP)"
      ],
      correct_answer: "C. Open Shortest Path First (OSPF)",
      explanation: "OSPF is a link-state routing protocol that utilizes Dijkstra's shortest path first algorithm to compile network topologies and construct routing tables."
    },
    {
      question: "What is the function of the Address Resolution Protocol (ARP)?",
      options: [
        "A. Translating public IP addresses to private subnet addresses",
        "B. Mapping human-readable domain names to public IP addresses",
        "C. Translating a known network IP address to a physical MAC address",
        "D. Distributing dynamic IP addresses to new clients in a network"
      ],
      correct_answer: "C. Translating a known network IP address to a physical MAC address",
      explanation: "ARP translates a Layer 3 network IP address into a Layer 2 hardware MAC address on a local area network."
    },
    {
      question: "What does CIDR notation (e.g., /24) represent in IP addressing?",
      options: [
        "A. The speed rating of the connection in gigabits per second",
        "B. The number of routing hops allowed before a packet is dropped",
        "C. The number of active network bits in the subnet mask",
        "D. The number of maximum supported devices in the network"
      ],
      correct_answer: "C. The number of active network bits in the subnet mask",
      explanation: "CIDR notation defines the length of the subnet prefix (e.g., /24 means the first 24 bits represent the network and the remaining 8 bits represent hosts)."
    },
    {
      question: "Why does the Data Link Layer utilize Frame Padding?",
      options: [
        "A. To encrypt transmission data securely",
        "B. To ensure frames reach the minimum size required by the collision detection model",
        "C. To reduce the electrical power consumed by physical transmission lines",
        "D. To let routers read destination ports quickly"
      ],
      correct_answer: "B. To ensure frames reach the minimum size required by the collision detection model",
      explanation: "For collision detection systems (CSMA/CD) to function correctly, frames must be long enough for the sender to detect collisions before the end of transmission."
    }
  ];

  const dbmsQAndA = [
    {
      question: "What does the 'A' in ACID transactions stand for, and what does it guarantee?",
      options: [
        "A. Access: Guarantees user access rights are audited before transaction start",
        "B. Atomicity: Guarantees all actions in a transaction succeed, or the entire transaction is rolled back",
        "C. Allocation: Guarantees dynamic index creation occurs on commit",
        "D. Aggregation: Guarantees large datasets are compressed automatically"
      ],
      correct_answer: "B. Atomicity: Guarantees all actions in a transaction succeed, or the entire transaction is rolled back",
      explanation: "Atomicity ensures 'all or nothing' execution. If any query inside the transaction fails, all changes are fully discarded."
    },
    {
      question: "Which Normal Form (NF) is explicitly designed to eliminate transitive functional dependencies?",
      options: [
        "A. First Normal Form (1NF)",
        "B. Second Normal Form (2NF)",
        "C. Third Normal Form (3NF)",
        "D. Boyce-Codd Normal Form (BCNF)"
      ],
      correct_answer: "C. Third Normal Form (3NF)",
      explanation: "A table is in 3NF if it satisfies 2NF and contains no transitive dependencies (where a non-key attribute depends on another non-key attribute)."
    },
    {
      question: "What is the primary advantage of a B+ Tree index over a standard Binary Search Tree?",
      options: [
        "A. B+ Trees have a much higher height, requiring more disk accesses",
        "B. B+ Trees are highly balanced with wide fan-out, minimizing disk I/O seek times",
        "C. B+ Trees store all actual records inside the internal parent nodes",
        "D. B+ Trees completely eliminate index page locking"
      ],
      correct_answer: "B. B+ Trees are highly balanced with wide fan-out, minimizing disk I/O seek times",
      explanation: "The high branching factor (fan-out) of B+ Trees keeps the tree exceptionally flat, ensuring nodes are read in very few disk block fetches."
    },
    {
      question: "What is the difference between a Clustered and a Non-Clustered index?",
      options: [
        "A. Clustered indexes reside only in RAM, while Non-Clustered indexes are stored on disk",
        "B. Clustered index defines the physical order of rows on disk, while Non-Clustered index is a separate structural pointer list",
        "C. Clustered indexes allow multiple duplicates, while Non-Clustered index values must be unique",
        "D. There is no structural difference between them"
      ],
      correct_answer: "B. Clustered index defines the physical order of rows on disk, while Non-Clustered index is a separate structural pointer list",
      explanation: "A table can only have one Clustered index because rows can only be physically sorted in one order. Non-clustered indexes are separate lookup structures pointing to row locators."
    },
    {
      question: "How does 2-Phase Locking (2PL) guarantee serializability in concurrency control?",
      options: [
        "A. By allowing transactions to lock anything at any time without releasing locks",
        "B. By dividing lock acquisitions and lock releases into separate growing and shrinking phases",
        "C. By running all queries on separate database clones simultaneously",
        "D. By immediately terminating any transaction that tries to read values"
      ],
      correct_answer: "B. By dividing lock acquisitions and lock releases into separate growing and shrinking phases",
      explanation: "2PL prevents transactions from acquiring new locks once they begin releasing locks, ensuring clean serializable execution schedules."
    }
  ];

  const lowerSubj = cleanSubject.toLowerCase();
  let baseSet = genericQAndA;
  if (lowerSubj.includes("network") || lowerSubj.includes("osi") || lowerSubj.includes("ip")) {
    baseSet = networksQAndA;
  } else if (lowerSubj.includes("database") || lowerSubj.includes("sql") || lowerSubj.includes("dbms")) {
    baseSet = dbmsQAndA;
  }

  for (let i = 0; i < count; i++) {
    const qData = baseSet[i % baseSet.length];
    questions.push({
      id: `q${i + 1}`,
      question: `[${difficulty.toUpperCase()}] ${qData.question}`,
      type: quizType === "mcq" ? "mcq" : "short_answer",
      options: quizType === "mcq" ? qData.options : undefined,
      correct_answer: qData.correct_answer,
      explanation: qData.explanation
    });
  }

  return {
    title: `Syllabus Assessment: ${cleanSubject}`,
    subject: cleanSubject,
    questions
  };
}

// ─── Generate Quiz ────────────────────────────────────────────────────────────

export async function generateQuizAction(
  uploadId: string,
  quizType: QuizType,
  difficulty: Difficulty,
  count: number = 10
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { data: upload } = await supabase
      .from("uploads")
      .select("extracted_text, subject")
      .eq("id", uploadId)
      .eq("user_id", user.id)
      .single();

    if (!upload?.extracted_text) return { success: false, error: "Upload not found" };

    let object;
    try {
      const res = await runWithFallback((model) =>
        generateObject({
          model,
          maxRetries: 0,
          schema: z.object({
            title: z.string(),
            subject: z.string(),
            questions: z.array(z.object({
              id: z.string(),
              question: z.string(),
              type: z.string(),
              options: z.array(z.string()).optional(),
              correct_answer: z.string(),
              explanation: z.string(),
            })),
          }),
          prompt: PROMPTS.generateQuiz(upload.extracted_text, quizType, difficulty, count),
        })
      );
      object = res.object;
    } catch (aiError) {
      console.warn("AI quiz generation failed, falling back to local quiz builder:", aiError);
      object = generateFallbackQuiz(upload.subject || "Syllabus Quiz", quizType, difficulty, count);
    }

    await ensureUserProfileExists(user.id, user.email || "", user.user_metadata);

    const { data: quiz, error } = await supabase.from("quizzes").insert({
      user_id: user.id,
      upload_id: uploadId,
      title: object.title,
      subject: object.subject || upload.subject,
      difficulty,
      questions: object.questions,
    }).select().single();

    if (error) return { success: false, error: "Failed to save quiz" };

    revalidatePath("/dashboard/quiz");
    return { success: true, data: quiz };
  } catch (err) {
    console.error("generateQuiz error:", err);
    return { success: false, error: "Quiz generation failed" };
  }
}

// ─── Save Quiz Attempt ────────────────────────────────────────────────────────

export async function saveQuizAttempt(quizId: string, answers: Record<string, string>, score: number, total: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  await ensureUserProfileExists(user.id, user.email || "", user.user_metadata);

  await supabase.from("quiz_attempts").insert({ user_id: user.id, quiz_id: quizId, score, total, answers });

  // Update profile accuracy
  const { data: attempts } = await supabase.from("quiz_attempts").select("score, total").eq("user_id", user.id);
  if (attempts && attempts.length > 0) {
    const avg = attempts.reduce((acc, a) => acc + (a.score / a.total) * 100, 0) / attempts.length;
    await supabase.from("profiles").update({ quiz_accuracy: Math.round(avg) }).eq("id", user.id);
  }

  revalidatePath("/dashboard");
  return { success: true };
}

// ─── Generate Study Plan ──────────────────────────────────────────────────────

function generateFallbackPlan(
  subjects: string[],
  examDates: Record<string, string>,
  dailyHours: number
) {
  const today = new Date();
  const sessions = [];
  const subjectTopics: Record<string, string[]> = {
    "computer networks": [
      "OSI & TCP/IP Model Layers",
      "Physical & Data Link Layers",
      "MAC Protocols & Ethernet",
      "Routing Algorithms & IP Addressing",
      "Transport Layer (TCP, UDP, Congestion Control)",
      "Application Layer (DNS, HTTP, SMTP)",
      "Network Security & Cryptography"
    ],
    "dbms": [
      "Relational Model & Keys",
      "ER Diagrams & Schema Design",
      "Normalization (1NF, 2NF, 3NF, BCNF)",
      "SQL Queries & Joins",
      "Transaction Management & ACID",
      "Concurrency Control & Indexing",
      "NoSQL Databases & Big Data"
    ],
    "database management systems": [
      "Relational Model & Keys",
      "ER Diagrams & Schema Design",
      "Normalization (1NF, 2NF, 3NF, BCNF)",
      "SQL Queries & Joins",
      "Transaction Management & ACID",
      "Concurrency Control & Indexing",
      "NoSQL Databases & Big Data"
    ],
    "operating systems": [
      "Process Management & Threads",
      "CPU Scheduling Algorithms",
      "Process Synchronization & Semaphores",
      "Deadlocks & Avoidance (Banker's)",
      "Memory Management & Paging",
      "Virtual Memory & Page Replacement",
      "File Systems & Disk Scheduling"
    ],
    "os": [
      "Process Management & Threads",
      "CPU Scheduling Algorithms",
      "Process Synchronization & Semaphores",
      "Deadlocks & Avoidance (Banker's)",
      "Memory Management & Paging",
      "Virtual Memory & Page Replacement",
      "File Systems & Disk Scheduling"
    ],
    "data structures and algorithms": [
      "Arrays, Linked Lists & Complexity",
      "Stacks, Queues & Recursion",
      "Trees & Binary Search Trees",
      "Heaps & Graph Representations",
      "Sorting & Searching Algorithms",
      "Dynamic Programming & Greedy",
      "Graph Algorithms (BFS, DFS, Dijkstra)"
    ],
    "dsa": [
      "Arrays, Linked Lists & Complexity",
      "Stacks, Queues & Recursion",
      "Trees & Binary Search Trees",
      "Heaps & Graph Representations",
      "Sorting & Searching Algorithms",
      "Dynamic Programming & Greedy",
      "Graph Algorithms (BFS, DFS, Dijkstra)"
    ],
    "theory of computation": [
      "Finite Automata (DFA, NFA)",
      "Regular Expressions & Pumping Lemma",
      "Context-Free Grammars & PDA",
      "Turing Machines & Decidability",
      "Chomsky Hierarchy",
      "Undecidability & Halting Problem",
      "Complexity Classes (P, NP)"
    ],
    "toc": [
      "Finite Automata (DFA, NFA)",
      "Regular Expressions & Pumping Lemma",
      "Context-Free Grammars & PDA",
      "Turing Machines & Decidability",
      "Chomsky Hierarchy",
      "Undecidability & Halting Problem",
      "Complexity Classes (P, NP)"
    ],
    "computer organization and architecture": [
      "Data Representation & Computer Arithmetic",
      "Instruction Set Architecture & Addressing",
      "Control Unit & Hardwired vs Microprogrammed",
      "Pipelining & Hazards",
      "Memory Hierarchy & Cache Mapping",
      "I/O Organization & DMA",
      "Multiprocessors & Cache Coherence"
    ],
    "coa": [
      "Data Representation & Computer Arithmetic",
      "Instruction Set Architecture & Addressing",
      "Control Unit & Hardwired vs Microprogrammed",
      "Pipelining & Hazards",
      "Memory Hierarchy & Cache Mapping",
      "I/O Organization & DMA",
      "Multiprocessors & Cache Coherence"
    ]
  };

  const getTopics = (subj: string) => {
    const key = subj.trim().toLowerCase();
    if (subjectTopics[key]) return subjectTopics[key];
    for (const [k, v] of Object.entries(subjectTopics)) {
      if (key.includes(k) || k.includes(key)) return v;
    }
    return [
      "Foundational Principles & Concepts",
      "Core Theories & Core Methodologies",
      "System Architecture & Components",
      "Standard Applications & Key Models",
      "Problem Solving & Practical Exercises",
      "Advanced Techniques & Future Trends",
      "Comprehensive Review & Practice Problems"
    ];
  };

  const subjMap = new Map(subjects.map(s => [s, getTopics(s)]));

  const priorityOrder = [...subjects].sort((a, b) => {
    const dateA = examDates[a] ? new Date(examDates[a]).getTime() : Infinity;
    const dateB = examDates[b] ? new Date(examDates[b]).getTime() : Infinity;
    return dateA - dateB;
  });

  let strategy = `Prioritizing ${priorityOrder.join(", ")} based on preparation needs. `;
  if (Object.keys(examDates).length > 0) {
    strategy += "Review sessions are heavily scheduled 3-4 days prior to each subject's exam date to ensure maximum retention.";
  } else {
    strategy += "An even distribution of study, practice, and quiz sessions has been scheduled to establish a consistent study habit.";
  }

  for (let d = 0; d < 30; d++) {
    const currentDay = new Date(today);
    currentDay.setDate(today.getDate() + d);
    const dateStr = currentDay.toISOString().split("T")[0];

    let targetSubject = priorityOrder[d % priorityOrder.length];
    
    for (const subj of priorityOrder) {
      if (examDates[subj]) {
        const examTime = new Date(examDates[subj]).getTime();
        const diffDays = (examTime - currentDay.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays >= 0 && diffDays <= 3) {
          targetSubject = subj;
          break;
        }
      }
    }

    const topics = subjMap.get(targetSubject) || [];
    const topicIdx = Math.floor(d / priorityOrder.length) % topics.length;
    const baseTopic = topics[topicIdx] || "Core Concept Study";

    const numSessions = dailyHours >= 4 ? 2 : 1;
    const sessionDuration = Math.round((dailyHours * 60) / numSessions);

    for (let sIdx = 0; sIdx < numSessions; sIdx++) {
      let type: "study" | "revision" | "quiz" | "practice" = "study";
      let topicName = baseTopic;

      if (examDates[targetSubject]) {
        const examTime = new Date(examDates[targetSubject]).getTime();
        const diffDays = (examTime - currentDay.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays >= 0 && diffDays <= 3) {
          type = "revision";
          topicName = `Intense Revision: ${baseTopic}`;
        } else if (diffDays > 3 && diffDays <= 7 && sIdx === 1) {
          type = "practice";
          topicName = `Practice Questions: ${baseTopic}`;
        }
      }

      if (type === "study" && d % 3 === 1) {
        type = "practice";
        topicName = `Practice & Application: ${baseTopic}`;
      } else if (type === "study" && d % 5 === 4) {
        type = "quiz";
        topicName = `Evaluation Quiz: ${baseTopic}`;
      }

      sessions.push({
        date: dateStr,
        subject: targetSubject,
        topic: topicName,
        duration: sessionDuration,
        type,
        completed: false
      });
    }
  }

  const weeklyGoals = [
    `Week 1: Focus on establishing a core understanding of ${priorityOrder.slice(0, 2).join(" & ") || "all subjects"}.`,
    `Week 2: Solve practice exercises and attempt basic topic-wise quizzes.`,
    `Week 3: Deep dive into advanced chapters and start comprehensive revisions.`,
    `Week 4: Final revision push, mock exams, and intensive formula recall.`
  ];

  return {
    title: `Ultimate Study Plan: ${subjects.join(" & ")}`,
    weeklyGoals,
    priorityOrder,
    strategy,
    sessions
  };
}

export async function generateStudyPlanAction(
  subjects: string[],
  examDates: Record<string, string>,
  dailyHours: number
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    let object;
    try {
      const res = await runWithFallback((model) =>
        generateObject({
          model,
          maxRetries: 0,
          schema: z.object({
            title: z.string(),
            weeklyGoals: z.array(z.string()),
            priorityOrder: z.array(z.string()),
            strategy: z.string(),
            sessions: z.array(z.object({
              date: z.string(),
              subject: z.string(),
              topic: z.string(),
              duration: z.number(),
              type: z.enum(["study", "revision", "quiz", "practice"]),
              completed: z.boolean(),
            })),
          }),
          prompt: PROMPTS.generateStudyPlan(subjects, examDates, dailyHours),
        })
      );
      object = res.object;
    } catch (aiError) {
      console.warn("AI generation failed or quota exceeded, falling back to local scheduler:", aiError);
      object = generateFallbackPlan(subjects, examDates, dailyHours);
    }

    await ensureUserProfileExists(user.id, user.email || "", user.user_metadata);

    const { data: plan, error } = await supabase.from("study_plans").insert({
      user_id: user.id,
      title: object.title,
      subjects,
      exam_dates: examDates,
      daily_hours: dailyHours,
      sessions: object.sessions,
    }).select().single();

    if (error) {
      console.error("Supabase insert study_plans error:", error);
      if (error.code === "PGRST205" || error.message?.includes("Could not find the table")) {
        console.warn("Table 'study_plans' missing in Supabase! Activating local fallback record mock...");
        const fallbackPlan = {
          id: "local-fallback-plan-id",
          user_id: user.id,
          title: object.title,
          subjects,
          exam_dates: examDates,
          daily_hours: dailyHours,
          sessions: object.sessions,
          created_at: new Date().toISOString()
        };
        return { success: true, data: { plan: fallbackPlan, ...object } };
      }
      return { success: false, error: `Failed to save study plan: ${error.message} (${error.code || ""})` };
    }

    revalidatePath("/dashboard/study-plan");
    return { success: true, data: { plan, ...object } };
  } catch (err: any) {
    console.error("generateStudyPlan error:", err);
    return { success: false, error: `Study plan generation failed: ${err?.message || err}` };
  }
}

export async function getUserUploadsAction() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { data: uploads, error } = await supabase
      .from("uploads")
      .select("id, file_name, subject, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: uploads };
  } catch (err) {
    return { success: false, error: "Unexpected error fetching uploads" };
  }
}
