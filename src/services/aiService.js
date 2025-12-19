// Local Knowledge Base Data
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
        answer: "I was created by **Rishabh**, a visionary developer who integrated Google's Antigravity technology to build this immersive 3D Personal Chatbot."
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

const FALLBACK_ANSWER = "I'm sorry, I only have access to data about Java and Spring Boot. Please ask me something related to those topics.";

// Simulate a network delay for realism
export const sendMessageToAI = async (message) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const lowerMsg = message.toLowerCase();

            // Simple keyword matching
            const match = KNOWLEDGE_BASE.find(entry =>
                entry.keywords.some(keyword => lowerMsg.includes(keyword))
            );

            if (match) {
                resolve(match.answer);
            } else {
                resolve(FALLBACK_ANSWER);
            }
        }, 800); // 800ms simulated delay
    });
};
