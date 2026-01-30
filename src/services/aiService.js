import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { CloseVectorWeb } from "@langchain/community/vectorstores/closevector/web";
import { Document } from "@langchain/core/documents";

// Local Knowledge Base Data
const FALLBACK_ANSWER = "I'm sorry, I couldn't find anything in my local knowledge base about that. (Offline Mode)";
const KNOWLEDGE_BASE = [
    {
        keywords: ['java', 'what is java'],
        answer: "Java is a high-level, class-based, object-oriented programming language that is designed to have as few implementation dependencies as possible. It is widely used for building enterprise-scale applications."
    },
    {
        keywords: ['spring', 'spring boot', 'what is spring'],
        answer: "Spring Boot is an open source Java-based framework used to create a micro Service. It provides a good platform for Java developers to develop a stand-alone and production-grade spring application that you can just run."
    },
    {
        keywords: ['dependency injection', 'di'],
        answer: "Dependency Injection (DI) is a design pattern used to implement IoC. It allows the creation of dependent objects outside of a class and provides those objects to a class through different ways (constructor, setter, or field)."
    },
    {
        keywords: ['jvm', 'machine'],
        answer: "JVM (Java Virtual Machine) is an abstract machine that enables your computer to run a Java program. When you run the Java program, Java compiler first compiles your Java code to bytecode. Then, the JVM translates bytecode into native machine code."
    },
    {
        keywords: ['rest', 'api', 'restful'],
        answer: "REST (Representational State Transfer) is an architectural style that defines a set of constraints to be used for creating web services. Spring Boot makes it very easy to build RESTful services using annotations like @RestController."
    },
    {
        keywords: ['hello', 'hi', 'hey'],
        answer: "Hello! I am your Java & Spring Boot assistant. Ask me anything about those topics."
    },
    // Persona / Identity
    {
        keywords: ['who made you', 'created by', 'author', 'developer'],
        answer: "I was created by **Rishabh**, a visionary developer who integrated Google's Antigravity technology to build this immersive 3D growGPT."
    },
    {
        keywords: ['who are you', 'what are you', 'identity', 'your name'],
        answer: "I am **growGPT**, an advanced Personal AI Assistant specialized in Java & Spring Boot development to help you crack the interview. I exist within this secure 3D Vault to assist you with your coding journey."
    },
    // Java Interview Questions
    {
        keywords: ['string', 'stringbuilder', 'stringbuffer', 'difference'],
        answer: "In Java: \n1. **String** is immutable (cannot be changed).\n2. **StringBuilder** is mutable and not thread-safe (fastest).\n3. **StringBuffer** is mutable and thread-safe (slower due to synchronization)."
    },
    {
        keywords: ['hashmap', 'hashtable', 'difference'],
        answer: "**HashMap** is non-synchronized, allows one null key, and is faster. \n**Hashtable** is synchronized (thread-safe), does not allow null keys/values, and is considered a legacy class."
    },
    {
        keywords: ['abstract class', 'interface', 'difference'],
        answer: "**Abstract Class**: Can have state (fields), constructors, and concrete methods. Improved in Java 8+ but still supports single inheritance.\n**Interface**: Supports multiple inheritance. Can have default/static methods (Java 8+) and private methods (Java 9+)."
    },
    {
        keywords: ['checked exception', 'unchecked exception'],
        answer: "**Checked Exceptions** (Compile-time): Must be handled (try-catch) or declared (throws), e.g., IOException, SQLException.\n**Unchecked Exceptions** (Runtime): Ignored by compiler, usually logic errors, e.g., NullPointerException, ArrayIndexOutOfBoundsException."
    },
    {
        keywords: ['stream api', 'java 8 feature'],
        answer: "The **Stream API** (java.util.stream) allows functional-style operations on collections (map, filter, reduce). It supports parallel processing and lazy evaluation for better performance."
    },
    // Spring Boot Interview Questions
    {
        keywords: ['spring boot xml', 'xml configuration'],
        answer: "Spring Boot largely avoids XML configuration. It favors 'Convention over Configuration' using annotations (@Component, @Bean) and properties files (application.properties), though XML is still supported if needed."
    },
    {
        keywords: ['springbootapplication', 'annotation'],
        answer: "**@SpringBootApplication** is a convenience annotation that combines:\n1. @Configuration\n2. @EnableAutoConfiguration\n3. @ComponentScan\nIt sits at the entry point of the application."
    },
    {
        keywords: ['spring profiles', 'profile'],
        answer: "**Spring Profiles** provide a way to segregate parts of your application configuration and make it valid only in certain environments (e.g., dev, test, prod). Usage: `@Profile('dev')` or `application-dev.properties`."
    },
    {
        keywords: ['autowired', 'inject', 'difference'],
        answer: "**@Autowired** is a Spring-specific annotation. **@Inject** is a standard Java (JSR-330) annotation. They behave similarly, but @Autowired has a 'required' attribute (default true), whereas @Inject is simpler."
    },
    {
        keywords: ['spring security', 'security'],
        answer: "**Spring Security** is a powerful authentication and access-control framework. In Spring Boot, it auto-configures basic auth by default. Key concepts include Principal, Authentication, Authorization, and Filter Chains."
    }
];

// Initialize Vector Store (Singleton Pattern)
let vectorStore = null;

const getVectorStore = async () => {
    if (vectorStore) return vectorStore;

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing VITE_GEMINI_API_KEY for Embeddings");

    const documents = KNOWLEDGE_BASE.map(item => {
        return new Document({
            pageContent: `${item.keywords.join(", ")}. ${item.answer}`, // Index both keywords and answer for better retrieval
            metadata: { answer: item.answer },
        });
    });

    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: apiKey,
        modelName: "embedding-001", // or text-embedding-004
    });

    vectorStore = await CloseVectorWeb.fromDocuments(documents, embeddings);
    return vectorStore;
};

// Fallback: Simple Keyword Matching
const keywordSearch = (message) => {
    const lowerMsg = message.toLowerCase();
    const match = KNOWLEDGE_BASE.find(entry =>
        entry.keywords.some(keyword => lowerMsg.includes(keyword))
    );
    return match ? match.answer : FALLBACK_ANSWER;
};

// Simulate a network delay for realism
// Simulate a network delay for realism
// Safe API Call Wrappers
// LangChain Implementation for Gemini
const callGemini = async (message, context, signal) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing VITE_GEMINI_API_KEY in .env");

    try {
        const model = new ChatGoogleGenerativeAI({
            model: "gemini-pro",
            apiKey: apiKey,
            maxOutputTokens: 2048,
        });

        const prompt = `
        You are an expert Java & Spring Boot AI assistant.
        Use the following retrieved context to answer the user's question.
        If the context is relevant, use it. If not, rely on your general knowledge but mention you are using general knowledge.
        
        Context: ${context}
        
        Question: ${message}
        `;

        if (signal?.aborted) throw new Error("Aborted");
        const response = await model.invoke(prompt, { signal });
        return response.content;
    } catch (error) {
        if (error.name === 'AbortError' || signal?.aborted) throw new Error("Aborted by user");
        throw new Error(error.message || "Gemini LangChain Error");
    }
};

// LangChain Implementation for OpenAI
const callChatGPT = async (message, context, signal) => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) throw new Error("Missing VITE_OPENAI_API_KEY in .env");

    try {
        const chat = new ChatOpenAI({
            modelName: "gpt-3.5-turbo",
            openAIApiKey: apiKey,
            temperature: 0.7,
        });

        const prompt = `
        You are an expert Java & Spring Boot AI assistant.
        Use the following retrieved context to answer the user's question.
        If the context is relevant, use it. If not, rely on your general knowledge but mention you are using general knowledge.
        
        Context: ${context}
        
        Question: ${message}
        `;

        if (signal?.aborted) throw new Error("Aborted");
        const response = await chat.invoke(prompt, { signal });
        return response.content;
    } catch (error) {
        if (error.name === 'AbortError' || signal?.aborted) throw new Error("Aborted by user");
        throw new Error(error.message || "OpenAI LangChain Error");
    }
};

// Main AI Handler
export const sendMessageToAI = async (message, provider = 'local', signal) => {
    try {
        if (signal?.aborted) throw new Error("Aborted by user");

        let context = "";
        let useRag = false;

        try {
            // 1. Try to Retrieve Context using RAG (Timeout after 3s to prevent hanging)
            const ragPromise = async () => {
                const store = await getVectorStore();
                const results = await store.similaritySearch(message, 2);
                return results;
            };

            const timeoutPromise = new Promise((_, reject) => {
                const id = setTimeout(() => reject(new Error("RAG Timeout")), 3000);
                if (signal) {
                    signal.addEventListener('abort', () => {
                        clearTimeout(id);
                        reject(new Error("Aborted by user"));
                    });
                }
            });

            const results = await Promise.race([ragPromise(), timeoutPromise]);

            context = results.map(res => res.metadata.answer).join("\n\n");
            useRag = true;
            console.log("Retrieved Context:", context);
        } catch (error) {
            if (error.message === "Aborted by user") throw error;
            console.warn("RAG/Embeddings check failed or timed out. Falling back to keyword search.", error);
            // Fallback proceeds below
        }

        if (signal?.aborted) throw new Error("Aborted by user");

        if (provider === 'gemini') {
            try {
                return await callGemini(message, context, signal);
            } catch (e) {
                if (e.message.includes("Aborted")) throw e;
                console.warn("Gemini API failed, falling back to simulated response:", e);
                return `[Gemini Error] ${e.message}. \n\n(Ensure VITE_GEMINI_API_KEY is set in .env)`;
            }
        }

        if (provider === 'chatgpt') {
            try {
                return await callChatGPT(message, context, signal);
            } catch (e) {
                if (e.message.includes("Aborted")) throw e;
                console.warn("ChatGPT API failed, falling back to simulated response:", e);
                return `[ChatGPT Error] ${e.message}. \n\n(Ensure VITE_OPENAI_API_KEY is set in .env)`;
            }
        }

        // Provider is 'local'
        if (useRag && context) {
            // If RAG worked, return the best match
            return context.split("\n\n")[0];
        } else {
            // If RAG failed, use robust keyword fallback
            console.log("Falling back to legacy keyword search for:", message);
            return new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    if (signal?.aborted) {
                        reject(new Error("Aborted by user"));
                    } else {
                        resolve(keywordSearch(message));
                    }
                }, 500);

                if (signal) {
                    signal.addEventListener('abort', () => {
                        clearTimeout(timeoutId);
                        reject(new Error("Aborted by user"));
                    });
                }
            });
        }
    } catch (error) {
        if (error.message.includes("Aborted")) {
            return "🛑 Generation stopped by user.";
        }
        return `Error: ${error.message}`;
    }
};
