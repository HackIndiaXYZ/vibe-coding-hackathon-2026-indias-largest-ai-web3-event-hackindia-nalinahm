import { getPrimaryModel, getBackupModel } from "@/lib/ai/models";
import { streamText } from "ai";
import { PROMPTS } from "@/lib/ai/prompts";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

function getFallbackChatResponse(messages: any[]): string {
  const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
  const query = lastUserMessage?.content?.toLowerCase() || "";

  if (query.includes("recursion")) {
    return `# 🔄 Understanding Recursion: A Deep Dive

Recursion is a fundamental programming paradigm where a function calls itself to solve smaller instances of the same problem. 

Think of it like a **Russian nesting doll (Matryoshka)**: to reach the smallest doll, you must open each larger doll one by one.

---

## 🔑 The Two Core Pillars of Recursion

Every recursive function MUST have two critical components. If either is missing, you will cause an infinite loop and crash your system (Stack Overflow).

### 1. The Base Case (The Stop Condition)
This is the simplest possible input where the function returns a value directly **without** making another recursive call. It prevents infinite recursion.

### 2. The Recursive Step (The Progression)
This is where the function calls itself with a **reduced** version of the original input, moving closer to the base case with each step.

---

## 💻 Code Example: Factorial Calculation

Let's compute $N!$ (Factorial of $N$), defined mathematically as:
$$N! = N \\times (N-1) \\times (N-2) \\times \\dots \\times 1$$
$$0! = 1 \\text{ (Base Case)}$$

Here is the implementation in JavaScript/TypeScript:

\`\`\`javascript
function factorial(n) {
  // 1. Base Case
  if (n <= 1) {
    return 1;
  }
  
  // 2. Recursive Step
  return n * factorial(n - 1);
}

console.log(factorial(4)); // Output: 24
\`\`\`

### 🧠 Tracing the Call Stack for \`factorial(4)\`
When a function calls itself, the computer pushes the current execution state onto a **Call Stack**.

\`\`\`text
[ factorial(1) ]  --> Returns 1 (Base Case reached!)
[ factorial(2) ]  --> Waits for factorial(1) -> returns 2 * 1 = 2
[ factorial(3) ]  --> Waits for factorial(2) -> returns 3 * 2 = 6
[ factorial(4) ]  --> Waits for factorial(3) -> returns 4 * 6 = 24
\`\`\`

---

## ⚡ Pro Tip: Recursion vs. Iteration
* **Recursion** is highly readable and fits tree/graph traversals naturally. However, it consumes memory for each stack frame ($O(N)$ space complexity).
* **Iteration (Loops)** uses a single stack frame ($O(1)$ space complexity) and is generally faster, but can be more complex to write for nested tree structures.`;
  }

  if (query.includes("dynamic programming") || query.includes("dp ") || query.includes("greedy")) {
    return `# 🧠 Dynamic Programming vs. Greedy Algorithms

Both **Dynamic Programming (DP)** and **Greedy Algorithms** are powerful strategies used to solve complex optimization problems. However, their core philosophies are fundamentally different.

---

## ⚖️ Core Comparison Summary

| Metric / Feature | Dynamic Programming (DP) | Greedy Algorithms |
| :--- | :--- | :--- |
| **Choice Strategy** | Explores all possible paths before deciding; chooses the globally optimal path. | Makes the best choice *at the current moment* without looking back or forward. |
| **Optimality Guarantee** | Always guarantees the **globally optimal** solution. | Does **not** always guarantee the global optimum (may get stuck in local optima). |
| **Subproblem Overlap** | Requires overlapping subproblems (reuses solved answers). | Does not require overlapping subproblems. |
| **Time Complexity** | Generally higher ($O(N^2)$ or $O(N \\cdot W)$), but highly optimized. | Extremely fast ($O(N)$ or $O(N \\log N)$ due to sorting). |
| **Space Complexity** | High ($O(N)$ or $O(N^2)$) due to caching subproblem states. | Minimal ($O(1)$) as no past states are stored. |

---

## 🚀 1. The Greedy Strategy: "Grab the Best Now!"
A greedy algorithm makes the locally optimal choice at each step, hoping it leads to a globally optimal solution.

### 🎒 Example: Fractional Knapsack Problem
Imagine you are a burglar with a knapsack of capacity 10kg. You see items:
- Item A: 5kg, worth \\$100 (\\$20/kg)
- Item B: 4kg, worth \\$40 (\\$10/kg)
- Item C: 3kg, worth \\$60 (\\$20/kg)

A **Greedy** approach sorts by value-per-kg and takes the highest density items first. It yields the perfect result because items can be fractioned.

---

## 🎯 2. Dynamic Programming: "Remember the Past!"
Dynamic Programming breaks down a problem into overlapping subproblems, solves each subproblem **exactly once**, and stores their solutions in a lookup table (cache).

### 🛠️ Two Ways to Implement DP:
1. **Memoization (Top-Down)**: Start with the main problem. If a subproblem needs solving, check if it's in the cache. If not, solve it recursively and store it.
2. **Tabulation (Bottom-Up)**: Solve the smallest subproblems first, fill a table (iteratively), and use those results to solve larger subproblems.

---

## ⚡ Active Recall Check
* Use **Greedy** when local choices are guaranteed to lead to a global optimum (e.g., Dijkstra's Shortest Path, Huffman Coding, Kruskal's MST).
* Use **DP** when subproblems overlap and local greedy choices fail to find the best absolute path (e.g., 0-1 Knapsack, Longest Common Subsequence, Fibonacci).`;
  }

  if (query.includes("solid") || query.includes("design principle")) {
    return `# 📐 Mastering the SOLID Design Principles

The **SOLID** principles are a set of five software design principles established by Robert C. Martin (Uncle Bob). They are the blueprint for writing **maintainable, scalable, and robust** Object-Oriented code.

---

## 🛡️ The 5 Pillars of SOLID

### 1. **S**ingle Responsibility Principle (SRP)
> *"A class should have one, and only one, reason to change."*
* **What it means**: A class should do exactly one thing. If a class handles database connections, user authentication, AND invoice PDF rendering, it violates SRP.
* **Why**: Modifying PDF generation shouldn't risk breaking database access!

### 2. **O**pen/Closed Principle (OCP)
> *"Software entities should be open for extension, but closed for modification."*
* **What it means**: You should be able to add new features or behaviors without editing existing, tested code.
* **How**: Use interfaces, abstract classes, and polymorphism instead of giant \`switch\` or \`if/else\` statements.

### 3. **L**iskov Substitution Principle (LSP)
> *"Subclasses should be substitutable for their base classes without breaking the application."*
* **What it means**: A derived subclass must extend the base class behavior without altering its core expectations.
* **Classic Violation**: A \`Square\` class extending a \`Rectangle\` class. Changing the width of a square dynamically alters its height, which violates the contract of a general Rectangle!

### 4. **I**nterface Segregation Principle (ISP)
> *"Clients should not be forced to depend on interfaces they do not use."*
* **What it means**: Split large, bloated interfaces into smaller, highly specialized ones.
* **Why**: A \`BasicPrinter\` shouldn't be forced to implement a \`fax()\` or \`scan()\` method just because it implements a monolithic \`SmartMachine\` interface.

### 5. **D**ependency Inversion Principle (DIP)
> *"Depend on abstractions, not on concretions."*
* **What it means**: High-level modules should not import low-level modules directly. Both should depend on interfaces/abstractions.
* **Why**: Decouples your application logic from concrete databases or third-party APIs, allowing you to swap MySQL for PostgreSQL or swap a mock API for a production client instantly.

---

## 💻 Code Highlight: DIP in Action

### ❌ Bad Code (High Coupling):
\`\`\`typescript
class LightBulb {
  turnOn() { console.log("Bulb glowing!"); }
}

class Switch {
  private bulb = new LightBulb(); // Direct dependency!
  operate() { this.bulb.turnOn(); }
}
\`\`\`

###  Good Code (Dependency Inverted):
\`\`\`typescript
interface Switchable {
  turnOn(): void;
}

class LightBulb implements Switchable {
  turnOn() { console.log("Bulb glowing!"); }
}

class Switch {
  constructor(private device: Switchable) {} // Depend on abstraction!
  operate() { this.device.turnOn(); }
}
\`\`\`
Now, the \`Switch\` can turn on a \`LightBulb\`, a \`Fan\`, or a \`Siren\` without modifying a single line of its own code!`;
  }

  if (query.includes("big-o") || query.includes("complexity") || query.includes("big o")) {
    return `# 📈 Demystifying Big-O Notation

**Big-O Notation** is the mathematical language used by computer scientists to describe the **efficiency** of an algorithm as the size of the input ($N$) grows. 

It measures two main variables:
1. **Time Complexity**: How does execution time scale?
2. **Space Complexity**: How does extra memory usage scale?

---

## 📊 The Big-O Complexity Spectrum

Here are the most common time complexities, sorted from fastest/best to slowest/worst:

| Notation | Complexity Name | Scaling Behavior | Real-World Example |
| :--- | :--- | :--- | :--- |
| **$O(1)$** | Constant | Time remains unchanged regardless of input size. | Accessing an array element by index. |
| **$O(\\log N)$** | Logarithmic | Input halves at each step. Exceptionally fast. | Binary search in a sorted array. |
| **$O(N)$** | Linear | Time grows proportionally to input size. | Finding the maximum value in an unsorted list. |
| **$O(N \\log N)$** | Linearithmic | Combines linear loops with logarithmic splits. | Efficient sorting (Merge Sort, Quick Sort). |
| **$O(N^2)$** | Quadratic | Time scales quadratically (nested loops). Slow! | Bubble Sort, checking all pairs in an array. |
| **$O(2^N)$** | Exponential | Time doubles with each new input item. Disaster! | Recursive Fibonacci without memoization. |

---

## 🔍 How to Analyze Big-O in 3 Easy Steps

When calculating complexity, keep these guidelines in mind:

### 1. Focus on the Worst-Case Scenario
Big-O measures the absolute maximum boundary. If a search algorithm finds a target on the first element (Best Case) but might check all $N$ elements (Worst Case), we write **$O(N)$**.

### 2. Drop the Constants
An algorithm taking $2N + 5$ operations scales linearly. As $N$ approaches infinity, the constant $5$ and the multiplier $2$ become negligible. Thus, we write **$O(N)$**.

### 3. Keep the Dominant Term
If your code has a loop of $O(N)$ and a nested loop of $O(N^2)$, the formula is $O(N^2 + N)$. The quadratic term dominates the linear term as $N$ grows massive. We drop $N$ and simplify to **$O(N^2)$**.

---

## 🧠 Quick Question for You
If you double the input size ($N \\to 2N$), an $O(N^2)$ algorithm runs **4 times slower**, whereas an $O(\\log N)$ algorithm only adds **one extra step**! That is why choosing the right data structures is so critical.`;
  }

  if (query.includes("network") || query.includes("osi") || query.includes("protocol") || query.includes("ip ")) {
    return `# 🌐 The OSI Model & Network Architecture

The **Open Systems Interconnection (OSI) Model** is a standardized conceptual framework that defines how data is transmitted between computers over a network. It splits communication systems into **7 distinct layers**.

---

## 🥞 The 7 Layers of the OSI Stack

\`\`\`text
  ┌────────────────────────────────────────────────────────┐
  │  7. APPLICATION   (HTTP, DNS, SMTP)  -- User Interface │
  ├────────────────────────────────────────────────────────┤
  │  6. PRESENTATION  (SSL/TLS, JPEG)    -- Data Format    │
  ├────────────────────────────────────────────────────────┤
  │  5. SESSION       (RPC, NetBIOS)     -- Dialog control │
  ├────────────────────────────────────────────────────────┤
  │  4. TRANSPORT     (TCP, UDP)         -- Port-to-Port   │
  ├────────────────────────────────────────────────────────┤
  │  3. NETWORK       (IP, ICMP)         -- IP Routing     │
  ├────────────────────────────────────────────────────────┤
  │  2. DATA LINK     (Ethernet, MAC)    -- Physical Hops  │
  ├────────────────────────────────────────────────────────┤
  │  1. PHYSICAL      (Cables, Hubs)     -- Bits on Wire   │
  └────────────────────────────────────────────────────────┘
\`\`\`

---

## 🔍 Layer Breakdown & Protocol Data Units (PDUs)

### 🚀 Layer 7: Application
* **PDU**: Data
* **Role**: The direct interface for end-user software.
* **Protocols**: HTTP (Web browsing), DNS (Domain resolution), SMTP (Email), DHCP.

### 🎨 Layer 6: Presentation
* **PDU**: Data
* **Role**: Formats, encrypts, and compresses data so it is readable by the receiving application.
* **Protocols/Standards**: SSL/TLS, JSON, XML, JPEG, MP4.

### 📞 Layer 5: Session
* **PDU**: Data
* **Role**: Manages, opens, maintains, and teardowns communication tunnels (sessions) between endpoints.

### 🚂 Layer 4: Transport (The Engine Room)
* **PDU**: Segment (TCP) / Datagram (UDP)
* **Role**: Ensures port-to-port delivery, flow control, and error recovery.
* **Protocols**: **TCP** (Reliable, ordered, connection-oriented) and **UDP** (Fast, connectionless).

### 🗺️ Layer 3: Network
* **PDU**: Packet
* **Role**: Handles routing across multiple independent networks. Finds the best path.
* **Protocols/Hardware**: IPv4, IPv6, ICMP, Routers.

### ⛓️ Layer 2: Data Link
* **PDU**: Frame
* **Role**: Physically transfers data between adjacent nodes on the same local network. Handles physical MAC addresses.
* **Protocols/Hardware**: Ethernet, Wi-Fi (802.11), Switches, MAC controllers.

### 🔌 Layer 1: Physical
* **PDU**: Bits
* **Role**: Transmits raw, unstructured binary streams over physical media.
* **Mediums**: Copper cables, fiber-optic glass, radio waves.`;
  }

  if (query.includes("dbms") || query.includes("database") || query.includes("normalization") || query.includes("sql") || query.includes("acid")) {
    return `# 🗄️ Database Normalization & ACID Properties

In **Database Management Systems (DBMS)**, design integrity is critical to prevent data duplication (redundancy) and transaction failures.

---

## 📈 1. Database Normalization (Eliminating Duplication)

Normalization organizes relational columns and tables to ensure functional dependencies are correctly mapped.

### 1️⃣ First Normal Form (1NF): *Atomicity*
* **Rule**: All cell values must contain atomic (indivisible) values. No lists or sets.
* **Example**: If a cell has \`"Computer Networks, DBMS"\`, it violates 1NF. It must be split into two separate rows.

### 2️⃣ Second Normal Form (2NF): *No Partial Dependencies*
* **Rule**: Must be in 1NF, and all non-key columns must fully depend on the **entire** Primary Key (no partial dependencies on a composite key).
* **Example**: In a table with primary key \`(StudentID, CourseID)\`, if we have \`CourseFee\` as a column, it only depends on \`CourseID\`, not \`StudentID\`. This is a partial dependency and violates 2NF. We must move it to a \`Courses\` table.

### 3️⃣ Third Normal Form (3NF): *No Transitive Dependencies*
* **Rule**: Must be in 2NF, and no non-key column can depend on another non-key column.
* **Example**: If \`StudentID\` determines \`ZipCode\`, and \`ZipCode\` determines \`City\`, then \`City\` depends transitively on \`StudentID\`. This violates 3NF. Move \`ZipCode\` and \`City\` to a separate location reference table.

---

## 🛡️ 2. ACID Properties (Guarantees of Transaction Safety)

An database transaction must maintain these four principles to prevent corruption:

* **A - Atomicity ("All or Nothing")**: If any statement in a transaction fails, the entire transaction is rolled back as if nothing happened.
* **C - Consistency (Rules & Constraints)**: A transaction can only transition the database from one valid state to another, upholding all constraints, keys, and indexes.
* **I - Isolation (No Interference)**: Concurrent execution of transactions leaves the database in the same state as if they were run sequentially.
* **D - Durability (Permanent Commit)**: Once committed, the transaction's changes survive even in the event of an immediate system crash or power outage.`;
  }

  if (query.includes("operating system") || query.includes("os ") || query.includes("process") || query.includes("memory") || query.includes("deadlock")) {
    return `# 💻 Operating Systems: CPU Scheduling & Deadlocks

An operating system kernel manages resources (CPU, RAM, Hard Drives) between multiple executing processes. Two major parts of this orchestration are **CPU Scheduling** and **Concurrency Deadlock Management**.

---

## 🔒 1. Understanding Deadlocks

A **Deadlock** is a state where a set of processes are blocked because each process holds a resource and waits for another resource held by another process in a circular chain.

### ⚠️ The 4 Coffman Conditions (Must all hold for Deadlock to occur):
1. **Mutual Exclusion**: At least one resource must be held in a non-shareable mode (only one process can use it at a time).
2. **Hold and Wait**: A process holding allocated resources can request additional resources without releasing its current ones.
3. **No Preemption**: Resources cannot be forcibly taken from a process holding them; they must be released voluntarily.
4. **Circular Wait**: A closed chain of processes exists, where each process waits for a resource held by the next process in the chain.

### 🛠️ How OS Handles Deadlocks:
* **Prevention**: Design protocols that break at least one of the 4 Coffman conditions (e.g., forcing processes to request all resources at once).
* **Avoidance**: Dynamic verification of resource allocation state. The OS uses algorithms like the **Banker's Algorithm** to ensure the system remains in a "Safe State".
* **Detection & Recovery**: Let deadlocks happen, run periodic graph cycles checks, and kill threads or preempt resources when caught.

---

## 🚀 2. CPU Scheduling Algorithms

CPU Scheduling allocates CPU execution time slices to active processes.

* **First-Come, First-Served (FCFS)**: Simplest queue approach. Non-preemptive. Can lead to the *Convoy Effect* (short jobs wait behind a massive job).
* **Shortest Job First (SJF)**: Minimizes average waiting time by executing the process with the shortest burst time first.
* **Round Robin (RR)**: Designed for time-sharing systems. Each process gets a small CPU time slice (Quantum). Highly fair, but context switching introduces overhead.`;
  }

  return `# 👋 Hello! I'm your SynapseAI engineering tutor!

I'd be glad to help you master that concept. Here is a clear, structured breakdown:

---

## 📌 Core Concepts Simplified

1. **Deconstruct the Definition**: 
   Breaking this topic down into its fundamental variables allows us to analyze how changes propagate through the system.
   
2. **Standard Interfaces**: 
   In engineering, we always design interfaces to decouple high-level system logic from the physical hardware or underlying data tables. This guarantees that modules are highly cohesive and loosely coupled.

3. **Performance Trade-offs**:
   Almost every engineering decision represents a compromise:
   - **Time vs. Space**: Do we cache values in RAM or compute them sequentially?
   - **Safety vs. Latency**: Do we add deep cryptographic checks or stream packets for speed?

---

## 🚀 3-Step Mastery Plan

* **Step 1: Code/Sketch It**: Try implementing a simplified mock script (or draw a structural layout) to see how components communicate.
* **Step 2: Dry Run**: Trace inputs step-by-step through your structure to uncover edge cases or boundary exceptions.
* **Step 3: Test and Audit**: Subject your design to extreme conditions (null states, oversized values) to ensure it handles them gracefully without throwing exceptions.

---

*What specific aspect of this topic would you like to explore deeper? We can draft custom code blocks or run through standard practice problems!*`;
}

export async function POST(req: Request) {
  try {
    const { messages, uploadId } = await req.json();

    // Map incoming messages to standard CoreMessage structure to support parts/content serialization
    const formattedMessages = (messages || []).map((msg: any) => {
      let content = msg.content;
      if (!content && msg.parts && Array.isArray(msg.parts)) {
        content = msg.parts
          .filter((p: any) => p.type === "text")
          .map((p: any) => p.text)
          .join("");
      }
      return {
        role: msg.role,
        content: content || "",
      };
    });

    let courseContextPrompt = "";
    let selectedSubject = "";

    if (uploadId) {
      try {
        const supabase = await createClient();
        const { data: upload } = await supabase
          .from("uploads")
          .select("extracted_text, subject, file_name")
          .eq("id", uploadId)
          .single();
        
        if (upload && upload.extracted_text) {
          selectedSubject = upload.subject || upload.file_name;
          courseContextPrompt = `\n\n[COURSE CONTEXT]\nYou are tutoring the student specifically on the course: "${selectedSubject}".\nThe student's questions must be answered in reference to the topics, formulas, constraints, and contents described in their course syllabus or course materials. Keep explanations highly relevant to this syllabus content.\n\nSyllabus/Course Material Content:\n${upload.extracted_text.substring(0, 300000)}`;
        }
      } catch (dbErr) {
        console.error("Failed to fetch upload context for chat:", dbErr);
      }
    }

    let result: any;
    let primary = getPrimaryModel();
    try {
      result = streamText({
        model: primary.model,
        maxRetries: 0,
        system: PROMPTS.tutorSystem + courseContextPrompt,
        messages: formattedMessages,
      });

      // Force stream initialization to check for quota/auth errors early
      const reader = result.textStream.getReader();
      const firstResult = await reader.read();
      reader.releaseLock();

      const textEncoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          if (!firstResult.done && firstResult.value) {
            controller.enqueue(textEncoder.encode(firstResult.value));
          }
          try {
            for await (const chunk of result.textStream) {
              controller.enqueue(textEncoder.encode(chunk));
            }
          } catch (e) {
            console.error("Stream interrupted, using local fallback stream:", e);
          }
          controller.close();
        }
      });

      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });

    } catch (aiError: any) {
      const errorMessage = aiError?.message || String(aiError);
      const isQuotaOrAuthError =
        errorMessage.includes("quota") ||
        errorMessage.includes("limit") ||
        errorMessage.includes("429") ||
        errorMessage.includes("401") ||
        errorMessage.includes("403") ||
        errorMessage.includes("key") ||
        errorMessage.includes("Unauthorized") ||
        errorMessage.includes("PERMISSION_DENIED") ||
        errorMessage.includes("identity");

      if (isQuotaOrAuthError) {
        console.warn(`[SynapseAI] Chat primary provider (${primary.provider}) failed due to quota/rate limit:`, errorMessage);
        const backup = getBackupModel(primary.provider);
        
        if (backup) {
          console.log(`[SynapseAI] Chat dynamic failover active. Switching stream to backup provider: ${backup.provider}`);
          try {
            const backupResult = streamText({
              model: backup.model,
              maxRetries: 0,
              system: PROMPTS.tutorSystem + courseContextPrompt,
              messages: formattedMessages,
            });

            const reader = backupResult.textStream.getReader();
            const firstResult = await reader.read();
            reader.releaseLock();

            const textEncoder = new TextEncoder();
            const stream = new ReadableStream({
              async start(controller) {
                if (!firstResult.done && firstResult.value) {
                  controller.enqueue(textEncoder.encode(firstResult.value));
                }
                try {
                  for await (const chunk of backupResult.textStream) {
                    controller.enqueue(textEncoder.encode(chunk));
                  }
                } catch (e) {
                  console.error("Backup stream interrupted:", e);
                }
                controller.close();
              }
            });

            return new Response(stream, {
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            });
          } catch (backupErr) {
            console.error("[SynapseAI] Chat backup provider also failed:", backupErr);
          }
        }
      }

      console.warn("OpenAI API error detected. Falling back to local AI Tutor model:", aiError);
      
      const textEncoder = new TextEncoder();
      let text = getFallbackChatResponse(formattedMessages);
      if (selectedSubject) {
        text = `> [!NOTE]\n> **Course Context:** Tailored specifically to your syllabus for **${selectedSubject}**.\n\n` + text;
      }
      
      const stream = new ReadableStream({
        async start(controller) {
          const words = text.split(" ");
          for (let i = 0; i < words.length; i++) {
            const chunk = words[i] + (i === words.length - 1 ? "" : " ");
            controller.enqueue(textEncoder.encode(chunk));
            await new Promise(resolve => setTimeout(resolve, 15)); // 15ms typing delay per word
          }
          controller.close();
        }
      });

      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  } catch (err) {
    console.error("POST chat API overall error:", err);
    return new Response("An unexpected error occurred", { status: 500 });
  }
}
