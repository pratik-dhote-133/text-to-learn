const fs = require('fs');

const course = {
  title: "JavaScript Mastery",
  description: "A complete guide to JavaScript, from basics to advanced asynchronous programming.",
  modules: [
    {
      title: "JavaScript Basics",
      lessons: [
        {
          title: "Introduction to Variables and Data Types",
          objectives: [
            "Understand how to declare variables using let, const, and var.",
            "Identify primitive data types like String, Number, Boolean, Null, and Undefined."
          ],
          content: "JavaScript is the programming language of the web. It allows you to implement complex features on web pages. The foundation of any JavaScript program is variables and data types. Variables are containers for storing data values. In modern JavaScript, we use 'let' and 'const' to declare variables. 'let' allows you to declare variables that can change later, while 'const' is for values that should never change. Understanding data types is equally crucial. JavaScript has several primitive data types: Strings for text, Numbers for numeric values, Booleans for true/false logic, Undefined for uninitialized variables, and Null for intentionally empty values. By mastering these building blocks, you set the stage for writing robust scripts. Remember, choosing between let and const correctly helps prevent bugs and makes your code's intent clear to other developers. Always default to const unless you know the value will change.",
          example: "const playerName = 'Alice'; let score = 0; score = score + 10;",
          summary: "Variables store data. Use const by default, and let for changing values. Primitive types include String, Number, and Boolean.",
          videoQuery: "Introduction to Variables and Data Types tutorial for beginners",
          mcqs: [
            { question: "Which keyword is used to declare a variable that cannot be reassigned?", options: ["let", "var", "const", "set"], answer: "const" },
            { question: "What data type is the value 42?", options: ["String", "Boolean", "Number", "Undefined"], answer: "Number" },
            { question: "Which is a primitive data type in JavaScript?", options: ["Array", "Object", "Boolean", "Function"], answer: "Boolean" },
            { question: "What is the recommended keyword for variables that will change?", options: ["const", "let", "var", "def"], answer: "let" },
            { question: "What value does an uninitialized variable hold?", options: ["Null", "Undefined", "0", "NaN"], answer: "Undefined" }
          ]
        },
        {
          title: "Operators and Expressions",
          objectives: [
            "Learn to use arithmetic and assignment operators.",
            "Understand comparison and logical operators for decision making."
          ],
          content: "Once you have data stored in variables, you need to manipulate it. This is where operators come in. Arithmetic operators (+, -, *, /) allow you to perform mathematical calculations. Assignment operators (=, +=, -=) let you assign values to variables. Beyond math, JavaScript uses comparison operators (==, ===, !=, !==, >, <) to compare values, which evaluate to Boolean results (true or false). It is highly recommended to always use the strict equality operator (===) because it checks for both value and type equality, avoiding unexpected type coercion bugs. Logical operators (&& for AND, || for OR, ! for NOT) are used to combine multiple conditions. Understanding how expressions evaluate is critical because it forms the basis of control flow in your applications. An expression is simply any valid unit of code that resolves to a value.",
          example: "let total = 10 + 5; const isAdult = age >= 18 && hasID === true;",
          summary: "Operators manipulate data. Use strict equality (===) to avoid bugs. Logical operators combine boolean conditions.",
          videoQuery: "Operators and Expressions tutorial for beginners",
          mcqs: [
            { question: "Which operator checks for both value and type equality?", options: ["==", "=", "===", "!=="], answer: "===" },
            { question: "What does the && operator represent?", options: ["Logical OR", "Logical NOT", "Logical AND", "Concatenation"], answer: "Logical AND" },
            { question: "What is the result of 5 + '5' in JavaScript?", options: ["10", "'55'", "Error", "Undefined"], answer: "'55'" },
            { question: "Which is an assignment operator?", options: ["+", "===", "+=", "&&"], answer: "+=" },
            { question: "What does the ! operator do?", options: ["Adds two values", "Negates a boolean", "Multiplies", "Compares values"], answer: "Negates a boolean" }
          ]
        },
        {
          title: "Control Flow: If Statements",
          objectives: [
            "Write conditional statements using if, else if, and else.",
            "Understand truthy and falsy values."
          ],
          content: "Control flow dictates the order in which your code executes. The most fundamental control flow structure is the 'if' statement. It allows your program to make decisions based on conditions. If the condition inside the parentheses evaluates to true, the code block runs. You can chain conditions using 'else if' and provide a default action with 'else'. JavaScript uses the concept of 'truthy' and 'falsy' values. A falsy value is one that translates to false when evaluated in a Boolean context. There are exactly six falsy values in JavaScript: false, 0, '', null, undefined, and NaN. Everything else is truthy. Mastering if statements allows you to build dynamic applications that respond to user input, data changes, and other events. It's the core of application logic.",
          example: "if (score >= 90) { console.log('A'); } else { console.log('B'); }",
          summary: "If statements control code execution based on conditions. Learn to identify the six falsy values to avoid logic errors.",
          videoQuery: "Control Flow: If Statements tutorial for beginners",
          mcqs: [
            { question: "Which of the following is a falsy value?", options: ["'false'", "1", "0", "[]"], answer: "0" },
            { question: "What keyword is used to provide a default condition?", options: ["then", "else", "otherwise", "catch"], answer: "else" },
            { question: "How many falsy values exist in JavaScript?", options: ["3", "5", "6", "Unlimited"], answer: "6" },
            { question: "Which statement checks multiple conditions?", options: ["if...then", "switch...if", "if...else if", "when...then"], answer: "if...else if" },
            { question: "What does 'if (true)' do?", options: ["Skips the block", "Always executes the block", "Throws an error", "Loops forever"], answer: "Always executes the block" }
          ]
        },
        {
          title: "Loops: For and While",
          objectives: [
            "Use for loops to iterate a specific number of times.",
            "Use while loops to execute code as long as a condition is true."
          ],
          content: "Loops are incredibly powerful tools that allow you to execute a block of code repeatedly. This prevents you from writing repetitive code and makes handling collections of data manageable. The 'for' loop is best when you know exactly how many times you want to iterate. It has three parts: initialization, condition, and final expression. The 'while' loop, on the other hand, runs continuously as long as its condition remains true. It is ideal for situations where the number of iterations is unknown beforehand. A common pitfall for beginners is creating infinite loops—loops where the condition never becomes false, crashing the browser. Always ensure your loop has a clear exit condition. Mastering loops is essential for traversing arrays and manipulating lists of elements in the DOM.",
          example: "for (let i = 0; i < 5; i++) { console.log(i); }",
          summary: "Loops repeat code blocks. Use 'for' for known iteration counts and 'while' for condition-based loops. Avoid infinite loops.",
          videoQuery: "Loops: For and While tutorial for beginners",
          mcqs: [
            { question: "Which loop is best when the number of iterations is known?", options: ["while", "for", "do...while", "forEach"], answer: "for" },
            { question: "What happens if a while loop condition never becomes false?", options: ["It stops automatically", "It throws a SyntaxError", "It creates an infinite loop", "It skips the code block"], answer: "It creates an infinite loop" },
            { question: "Which part of a for loop executes only once?", options: ["Condition", "Final expression", "Initialization", "The code block"], answer: "Initialization" },
            { question: "What keyword is used to exit a loop early?", options: ["stop", "exit", "break", "return"], answer: "break" },
            { question: "A while loop evaluates its condition ___ executing the block.", options: ["before", "after", "during", "instead of"], answer: "before" }
          ]
        }
      ]
    },
    {
      title: "Functions and Scope",
      lessons: [
        {
          title: "Introduction to Functions",
          objectives: [
            "Declare and call basic JavaScript functions.",
            "Understand the purpose of reusable code blocks."
          ],
          content: "Functions are reusable blocks of code designed to perform a specific task. They are the fundamental building blocks of any complex JavaScript application. By encapsulating logic within a function, you avoid repeating yourself (the DRY principle: Don't Repeat Yourself). You declare a function using the 'function' keyword, followed by a name, parentheses, and curly braces containing the code. To execute the function, you 'call' or 'invoke' it using its name followed by parentheses. Functions make your code modular, easier to read, and simpler to debug. Instead of writing the same 10 lines of code in 5 different places, you write it once in a function and call it 5 times. This is the first step toward writing clean, maintainable software architecture.",
          example: "function greet() { console.log('Hello!'); } greet();",
          summary: "Functions encapsulate reusable code. They help maintain the DRY principle and make applications modular and readable.",
          videoQuery: "Introduction to Functions tutorial for beginners",
          mcqs: [
            { question: "What keyword is used to define a standard function?", options: ["func", "def", "function", "method"], answer: "function" },
            { question: "What does the DRY principle stand for?", options: ["Do Repeat Yourself", "Don't Repeat Yourself", "Data Retrieval Yield", "Dynamic Response Yes"], answer: "Don't Repeat Yourself" },
            { question: "How do you execute a function named 'start'?", options: ["call start", "start()", "run start()", "execute(start)"], answer: "start()" },
            { question: "What surrounds the body of a function?", options: ["[]", "()", "{}", "<>"], answer: "{}" },
            { question: "Functions help make code more...", options: ["Repetitive", "Modular", "Complex", "Slower"], answer: "Modular" }
          ]
        },
        {
          title: "Parameters and Return Values",
          objectives: [
            "Pass data into functions using parameters and arguments.",
            "Output data from functions using the return statement."
          ],
          content: "Functions become truly powerful when they can accept inputs and produce outputs. Parameters are placeholders defined in the function declaration, acting like local variables inside the function. When you call the function, you pass actual values, known as arguments, which replace the parameters. This allows the same function to process different data. Furthermore, functions can send data back to the place they were called using the 'return' keyword. Once a return statement is executed, the function immediately stops running, and the specified value is passed back. If a function doesn't have a return statement, it implicitly returns 'undefined'. Understanding parameters and return values is essential for building data pipelines and performing calculations.",
          example: "function add(a, b) { return a + b; } const sum = add(5, 10);",
          summary: "Parameters act as inputs, and return statements provide outputs. The return keyword also immediately exits the function.",
          videoQuery: "Parameters and Return Values tutorial for beginners",
          mcqs: [
            { question: "What is the term for the actual value passed to a function?", options: ["Parameter", "Argument", "Variable", "Property"], answer: "Argument" },
            { question: "Which keyword sends a value back from a function?", options: ["send", "output", "return", "give"], answer: "return" },
            { question: "What happens when a return statement executes?", options: ["The function restarts", "The loop continues", "The function exits immediately", "An error is thrown"], answer: "The function exits immediately" },
            { question: "What does a function return if no return statement is present?", options: ["0", "null", "false", "undefined"], answer: "undefined" },
            { question: "Parameters are defined in the function's...", options: ["Body", "Declaration", "Return statement", "Console"], answer: "Declaration" }
          ]
        },
        {
          title: "Arrow Functions",
          objectives: [
            "Write concise functions using ES6 arrow syntax.",
            "Understand the lexical binding of 'this'."
          ],
          content: "Arrow functions, introduced in ES6, provide a more concise syntax for writing function expressions. They remove the need for the 'function' keyword and use a 'fat arrow' (=>). For single-line functions, you can even omit the curly braces and the 'return' keyword, resulting in an implicit return. This makes code cleaner, especially when passing functions as callbacks to array methods like map or filter. Beyond syntax, arrow functions have a crucial behavioral difference: they do not have their own 'this' binding. Instead, they inherit 'this' from the enclosing lexical scope. This is incredibly useful in object methods and event listeners where traditional functions often lose their context, requiring workarounds like .bind().",
          example: "const multiply = (a, b) => a * b;",
          summary: "Arrow functions offer concise syntax and implicit returns. Crucially, they inherit 'this' from their surrounding context.",
          videoQuery: "Arrow Functions tutorial for beginners",
          mcqs: [
            { question: "Which symbol denotes an arrow function?", options: ["->", "=>", "==>", ">>"], answer: "=>" },
            { question: "What is omitted for an implicit return in a single-line arrow function?", options: ["Parentheses", "Parameters", "Curly braces and 'return'", "The arrow"], answer: "Curly braces and 'return'" },
            { question: "Arrow functions do NOT have their own...", options: ["Parameters", "Scope", "'this' binding", "Syntax"], answer: "'this' binding" },
            { question: "In what version of JavaScript were arrow functions introduced?", options: ["ES5", "ES6", "ES2020", "ES1"], answer: "ES6" },
            { question: "Arrow functions are particularly useful as...", options: ["Constructors", "Callbacks", "Classes", "Modules"], answer: "Callbacks" }
          ]
        },
        {
          title: "Understanding Scope",
          objectives: [
            "Differentiate between global, function, and block scope.",
            "Avoid polluting the global namespace."
          ],
          content: "Scope determines the accessibility or visibility of variables in your code. JavaScript has three main types of scope. Global scope means a variable is accessible from anywhere in your code; this should be used sparingly to avoid naming conflicts. Function scope means variables declared inside a function are only accessible within that function. ES6 introduced Block scope with 'let' and 'const', meaning variables declared inside any set of curly braces {} (like an if statement or for loop) are confined to that block. Variables declared with 'var' ignore block scope, which often leads to bugs. Understanding scope prevents unintended side effects and data leakage. It allows you to organize your code securely, ensuring that variables are only accessible where they are actually needed.",
          example: "if(true) { let local = 'hidden'; } console.log(local); // Error",
          summary: "Scope controls variable visibility. Prefer block-scoped let and const over function-scoped var to prevent bugs.",
          videoQuery: "Understanding Scope tutorial for beginners",
          mcqs: [
            { question: "Which keyword does NOT support block scope?", options: ["let", "const", "var", "Both let and const"], answer: "var" },
            { question: "Variables accessible from anywhere in the code are in the ___ scope.", options: ["Function", "Local", "Block", "Global"], answer: "Global" },
            { question: "What defines a block scope?", options: ["Parentheses ()", "Curly braces {}", "Square brackets []", "Quotes ''"], answer: "Curly braces {}" },
            { question: "Why should you avoid polluting the global scope?", options: ["It's slower", "To prevent naming conflicts", "It takes up disk space", "It requires more typing"], answer: "To prevent naming conflicts" },
            { question: "A variable declared with 'let' inside a function is...", options: ["Globally accessible", "Function scoped", "Accessible outside the function", "A constant"], answer: "Function scoped" }
          ]
        }
      ]
    },
    {
      title: "DOM Manipulation",
      lessons: [
        {
          title: "Selecting DOM Elements",
          objectives: [
            "Understand what the Document Object Model (DOM) is.",
            "Use methods like querySelector and getElementById to select elements."
          ],
          content: "The Document Object Model (DOM) is a programming interface for HTML. It represents the page so that programs can change the document structure, style, and content. The DOM represents the document as nodes and objects. To manipulate a web page with JavaScript, you first need to select the HTML elements you want to interact with. The `document` object provides several methods for this. `document.getElementById()` is the fastest way to select a single element by its unique ID. For more flexibility, `document.querySelector()` allows you to select the first element that matches a CSS selector (like a class or tag). If you need all matching elements, use `document.querySelectorAll()`, which returns a NodeList. Selecting elements is the critical first step in making a static webpage interactive.",
          example: "const header = document.querySelector('.main-title');",
          summary: "The DOM represents HTML as objects. Use querySelector and getElementById to target specific elements for manipulation.",
          videoQuery: "Selecting DOM Elements tutorial for beginners",
          mcqs: [
            { question: "What does DOM stand for?", options: ["Document Object Model", "Data Object Method", "Display Orientation Mode", "Digital Operations Manager"], answer: "Document Object Model" },
            { question: "Which method selects an element using a CSS selector?", options: ["getElementByClass", "querySelector", "selectElement", "findNode"], answer: "querySelector" },
            { question: "What does querySelectorAll return?", options: ["An Array", "A single Element", "A NodeList", "A String"], answer: "A NodeList" },
            { question: "Which object serves as the entry point to the DOM?", options: ["window", "html", "browser", "document"], answer: "document" },
            { question: "getElementById requires the ID to be prefixed with a '#'.", options: ["True", "False", "Only in ES6", "Depends on the browser"], answer: "False" }
          ]
        },
        {
          title: "Modifying Content and Attributes",
          objectives: [
            "Change text and HTML content of elements.",
            "Update element attributes like src, href, and classes."
          ],
          content: "Once you have selected an element, you can dynamically modify its content and attributes. To change the text visible to the user, use the `textContent` property. If you need to inject actual HTML tags, use `innerHTML` (but be cautious of cross-site scripting attacks if using user input). Beyond text, you can modify attributes. You can change an image's source by updating the `.src` property or an anchor tag's destination via `.href`. Managing CSS classes is also crucial for visual updates; the `classList` property provides methods like `add()`, `remove()`, and `toggle()` to easily manipulate classes without overwriting existing ones. These techniques allow you to update the UI without requiring a full page refresh.",
          example: "imageElement.src = 'new-pic.jpg'; textElement.textContent = 'Updated!';",
          summary: "Use textContent for text and innerHTML for HTML. Use classList methods to easily toggle CSS classes dynamically.",
          videoQuery: "Modifying Content and Attributes tutorial for beginners",
          mcqs: [
            { question: "Which property is safest for updating plain text?", options: ["innerHTML", "innerText", "textContent", "value"], answer: "textContent" },
            { question: "Which classList method adds a class if missing, and removes it if present?", options: ["switch()", "toggle()", "swap()", "change()"], answer: "toggle()" },
            { question: "Using innerHTML with user input can lead to...", options: ["Faster load times", "Security vulnerabilities (XSS)", "Better SEO", "Automatic translation"], answer: "Security vulnerabilities (XSS)" },
            { question: "How would you access the source of an image element 'img'?", options: ["img.source", "img.href", "img.src", "img.link"], answer: "img.src" },
            { question: "classList.add() overwrites all existing classes.", options: ["True", "False", "Sometimes", "Only in Chrome"], answer: "False" }
          ]
        },
        {
          title: "Creating and Appending Elements",
          objectives: [
            "Create new HTML elements entirely via JavaScript.",
            "Insert new elements into the live DOM tree."
          ],
          content: "JavaScript allows you to build completely new parts of a webpage on the fly. To create a new element, use the `document.createElement()` method, passing the tag name (like 'div' or 'li'). However, creating an element only exists in memory; it isn't visible on the page yet. To make it visible, you must attach it to an existing element in the DOM tree. The `appendChild()` method allows you to add your new element as the last child of a parent element. Alternatively, `prepend()` adds it as the first child. You must configure your new element (adding text, classes, etc.) before or after appending it. This dynamic creation is how features like infinite scrolling and dynamic to-do lists populate content without writing hardcoded HTML.",
          example: "const li = document.createElement('li'); li.textContent = 'New Item'; ul.appendChild(li);",
          summary: "Use createElement to make nodes in memory. Use appendChild or prepend to insert them into the visible DOM.",
          videoQuery: "Creating and Appending Elements tutorial for beginners",
          mcqs: [
            { question: "Which method creates a new HTML node?", options: ["createNode()", "newElement()", "document.createElement()", "makeHTML()"], answer: "document.createElement()" },
            { question: "Where does appendChild() insert an element?", options: ["At the beginning", "At the end", "Before the parent", "After the parent"], answer: "At the end" },
            { question: "An element created with createElement is immediately visible.", options: ["True", "False", "Depends on the tag", "Only if it has text"], answer: "False" },
            { question: "Which method adds an element as the FIRST child?", options: ["insertFirst()", "addTop()", "prepend()", "appendChild()"], answer: "prepend()" },
            { question: "What do you pass to createElement()?", options: ["An object", "HTML string", "A tag name string", "A CSS selector"], answer: "A tag name string" }
          ]
        },
        {
          title: "Event Listeners",
          objectives: [
            "Understand the concept of event-driven programming.",
            "Attach event listeners to handle user interactions like clicks."
          ],
          content: "JavaScript in the browser is event-driven. This means code executes in response to events—actions occurring in the browser, such as a user clicking a button, pressing a key, or submitting a form. To make your webpage react, you use the `addEventListener()` method. It takes two primary arguments: the type of event to listen for (like 'click' or 'submit') and a callback function to execute when the event happens. The callback function automatically receives an 'event object' containing details about the interaction (like which key was pressed or the mouse coordinates). Using event listeners instead of HTML inline attributes (like onclick) keeps your HTML clean and allows you to attach multiple listeners to a single element.",
          example: "button.addEventListener('click', (event) => { console.log('Clicked!'); });",
          summary: "Event listeners wait for user actions to trigger code. Always use addEventListener instead of inline HTML handlers for better architecture.",
          videoQuery: "Event Listeners tutorial for beginners",
          mcqs: [
            { question: "What is the recommended method to handle events?", options: ["HTML onclick", "addEventListener", "document.onEvent", "listen()"], answer: "addEventListener" },
            { question: "What is passed automatically to the callback function of an event listener?", options: ["The DOM", "An event object", "The window", "Nothing"], answer: "An event object" },
            { question: "What is the first argument of addEventListener?", options: ["The callback function", "The element ID", "The event type string", "A boolean"], answer: "The event type string" },
            { question: "JavaScript in the browser is primarily...", options: ["Event-driven", "Data-driven", "Class-driven", "Linear"], answer: "Event-driven" },
            { question: "You can attach multiple event listeners to the same element.", options: ["True", "False", "Only for different event types", "Only in modern browsers"], answer: "True" }
          ]
        }
      ]
    },
    {
      title: "Async JavaScript",
      lessons: [
        {
          title: "Understanding Asynchronous Code",
          objectives: [
            "Differentiate between synchronous and asynchronous operations.",
            "Understand the role of the Event Loop and callbacks."
          ],
          content: "JavaScript is single-threaded, meaning it can only do one thing at a time. Synchronous code executes line by line, pausing the program until the current line finishes. This is a problem for slow operations like network requests or timers; if they were synchronous, the entire webpage would freeze. Asynchronous JavaScript solves this. When an async operation starts (like `setTimeout`), JavaScript hands it off to the browser's Web APIs and continues executing the next line of code immediately. Once the async task finishes, a callback function is placed in a queue. The Event Loop constantly checks if the main thread is empty; when it is, it pushes the callback onto the thread to execute. Understanding this non-blocking architecture is critical for building fast, responsive applications.",
          example: "console.log('1'); setTimeout(() => console.log('2'), 1000); console.log('3'); // Outputs 1, 3, 2",
          summary: "Async code prevents the browser from freezing during slow tasks. The Event Loop manages the execution of async callbacks.",
          videoQuery: "Understanding Asynchronous Code tutorial for beginners",
          mcqs: [
            { question: "JavaScript is by default...", options: ["Multi-threaded", "Single-threaded", "Double-threaded", "Thread-agnostic"], answer: "Single-threaded" },
            { question: "What manages the execution order of async callbacks?", options: ["The Call Stack", "The Web API", "The Event Loop", "The DOM"], answer: "The Event Loop" },
            { question: "Synchronous code execution means...", options: ["Code runs simultaneously", "Code runs line-by-line, blocking execution", "Code runs in the background", "Code is skipped if slow"], answer: "Code runs line-by-line, blocking execution" },
            { question: "Which function is a common example of an async operation?", options: ["console.log", "Math.random", "setTimeout", "Array.push"], answer: "setTimeout" },
            { question: "If a slow operation blocks the main thread, the UI will...", options: ["Speed up", "Freeze", "Refresh", "Close"], answer: "Freeze" }
          ]
        },
        {
          title: "Introduction to Promises",
          objectives: [
            "Understand what a Promise represents.",
            "Handle successful and failed outcomes using .then() and .catch()."
          ],
          content: "Historically, async operations were handled entirely with nested callbacks, leading to messy, unreadable code known as 'callback hell'. Promises were introduced to solve this. A Promise is an object representing the eventual completion (or failure) of an asynchronous operation and its resulting value. Think of it like a restaurant buzzer: you place an order (async task starts), receive a buzzer (the Promise), and can do other things. The Promise has three states: Pending, Fulfilled (resolved), or Rejected (failed). You attach a `.then()` method to handle the successful data, and a `.catch()` method to handle any errors. This creates a clean, chainable structure that is much easier to read and maintain than deeply nested callbacks.",
          example: "fetchData().then(data => console.log(data)).catch(err => console.error(err));",
          summary: "Promises represent future values of async operations. They solve 'callback hell' by providing chainable .then() and .catch() methods.",
          videoQuery: "Introduction to Promises tutorial for beginners",
          mcqs: [
            { question: "What problem do Promises primarily solve?", options: ["Memory leaks", "Callback hell", "Syntax errors", "Slow internet"], answer: "Callback hell" },
            { question: "Which method is called when a Promise is successfully resolved?", options: [".catch()", ".finally()", ".then()", ".done()"], answer: ".then()" },
            { question: "Which is NOT a state of a Promise?", options: ["Pending", "Fulfilled", "Waiting", "Rejected"], answer: "Waiting" },
            { question: "What method is used to handle Promise errors?", options: [".error()", ".fail()", ".catch()", ".reject()"], answer: ".catch()" },
            { question: "A Promise is an object representing an eventual completion or failure.", options: ["True", "False", "Only for network requests", "Only in Node.js"], answer: "True" }
          ]
        },
        {
          title: "Modern Async/Await",
          objectives: [
            "Write asynchronous code that looks synchronous using async/await.",
            "Handle errors cleanly with try/catch blocks."
          ],
          content: "While Promises improved async code, ES2017 introduced `async` and `await`, providing syntactic sugar over Promises to make async code look and behave a bit more like synchronous code. By placing the `async` keyword before a function declaration, you ensure the function always returns a Promise. Inside that function, you can use the `await` keyword before any Promise. The `await` keyword pauses the execution of that specific function until the Promise settles, making it incredibly easy to read the flow of data. Because `await` pauses execution, error handling is done using standard `try...catch` blocks, exactly how you handle synchronous errors. This unification of syntax makes `async/await` the modern standard for writing complex asynchronous logic.",
          example: "async function getUser() { try { const res = await fetch(url); } catch (e) { console.log(e); } }",
          summary: "Async/await makes asynchronous code look synchronous. It relies on Promises under the hood and uses try/catch for error handling.",
          videoQuery: "Modern Async Await tutorial for beginners",
          mcqs: [
            { question: "What does an async function always return?", options: ["A string", "Undefined", "A Promise", "An Array"], answer: "A Promise" },
            { question: "Where can you use the 'await' keyword?", options: ["Anywhere", "Only inside async functions", "Inside loops", "Inside callbacks"], answer: "Only inside async functions" },
            { question: "How do you handle errors in an async/await function?", options: [".catch()", "try...catch", "if...else", "error()"], answer: "try...catch" },
            { question: "The 'await' keyword ___ the execution of the async function until the promise settles.", options: ["stops completely", "pauses", "speeds up", "cancels"], answer: "pauses" },
            { question: "Async/await is a completely different system from Promises.", options: ["True", "False", "Depends on the browser", "Only in ES5"], answer: "False" }
          ]
        },
        {
          title: "Making API Requests with Fetch",
          objectives: [
            "Use the Fetch API to retrieve data from external servers.",
            "Parse JSON responses into JavaScript objects."
          ],
          content: "One of the most common uses of asynchronous JavaScript is communicating with servers to get or save data without reloading the page. The modern browser standard for this is the `fetch()` API. Calling `fetch(url)` initiates a network request and returns a Promise that resolves to a Response object. However, this response is raw HTTP data. To use the data in JavaScript, you must call a method like `.json()` on the response, which also returns a Promise because parsing large data can take time. Combining `fetch()` with `async/await` creates a clean, readable pattern for interacting with REST APIs. Always remember to handle network failures and check the `response.ok` property, as `fetch` only rejects on network errors, not HTTP errors (like 404).",
          example: "const response = await fetch('/api/users'); const users = await response.json();",
          summary: "The Fetch API is used for network requests. It returns a Promise. Remember to parse the response using .json() to get usable data.",
          videoQuery: "Making API Requests with Fetch tutorial for beginners",
          mcqs: [
            { question: "What does the fetch() API return immediately?", options: ["JSON data", "A String", "A Promise", "An Error"], answer: "A Promise" },
            { question: "Which method parses a fetch response into a JavaScript object?", options: [".parse()", ".text()", ".json()", ".object()"], answer: ".json()" },
            { question: "When does fetch() reject a Promise?", options: ["On a 404 error", "On a 500 error", "Only on a network failure", "Whenever the server is slow"], answer: "Only on a network failure" },
            { question: "Which property of the Response object indicates a successful HTTP status?", options: ["response.success", "response.ok", "response.good", "response.done"], answer: "response.ok" },
            { question: "fetch() can be used with async/await.", options: ["True", "False", "Only for GET requests", "Only in Node.js"], answer: "True" }
          ]
        }
      ]
    }
  ]
};

console.log(JSON.stringify(course, null, 2));
