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
