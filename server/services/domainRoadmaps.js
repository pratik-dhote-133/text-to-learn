const roadmaps = {
  tech: {
    modules: [
      {
        title: "Programming Fundamentals & Syntax",
        lessons: [
          { title: "Variables, Data Types, and Operators" },
          { title: "Control Flow and Conditionals" },
          { title: "Functions and Scope" },
          { title: "Error Handling and Debugging" }
        ]
      },
      {
        title: "Object-Oriented & Functional Concepts",
        lessons: [
          { title: "Classes, Objects, and Methods" },
          { title: "Inheritance and Polymorphism" },
          { title: "Higher-Order Functions" },
          { title: "Memory Management Basics" }
        ]
      },
      {
        title: "Core Data Structures & Algorithms",
        lessons: [
          { title: "Arrays and Strings Manipulation" },
          { title: "Hash Maps and Dictionaries" },
          { title: "Linked Lists, Stacks, and Queues" },
          { title: "Recursion and Basic Sorting" }
        ]
      },
      {
        title: "Advanced Topics & Architecture",
        lessons: [
          { title: "Asynchronous Programming and Promises" },
          { title: "File I/O and External APIs" },
          { title: "Design Patterns Overview" },
          { title: "Testing and Best Practices" }
        ]
      }
    ]
  },
  dsa: {
    modules: [
      {
        title: "Basic Data Structures",
        lessons: [
          { title: "Arrays and Memory Representation" },
          { title: "Strings and Character Arrays" },
          { title: "Searching Techniques (Linear & Binary)" },
          { title: "Basic Sorting Algorithms (Bubble, Insertion, Selection)" }
        ]
      },
      {
        title: "Intermediate Data Structures",
        lessons: [
          { title: "Singly and Doubly Linked Lists" },
          { title: "Stacks and their Applications" },
          { title: "Queues and Deques" },
          { title: "Time and Space Complexity Analysis (Big-O)" }
        ]
      },
      {
        title: "Trees and Hashing",
        lessons: [
          { title: "Introduction to Trees and Binary Trees" },
          { title: "Binary Search Trees (BST)" },
          { title: "Heaps and Priority Queues" },
          { title: "Hash Tables and Collision Resolution" }
        ]
      },
      {
        title: "Advanced Algorithms",
        lessons: [
          { title: "Graphs and Traversal (BFS & DFS)" },
          { title: "Advanced Sorting (Merge, Quick)" },
          { title: "Recursion and Backtracking Basics" },
          { title: "Introduction to Dynamic Programming" }
        ]
      }
    ]
  },
  machine_learning: {
    modules: [
      {
        title: "Foundations of Machine Learning",
        lessons: [
          { title: "Introduction to AI and Machine Learning" },
          { title: "Python Libraries for ML (NumPy, Pandas)" },
          { title: "Data Preprocessing and Cleaning" },
          { title: "Exploratory Data Analysis" }
        ]
      },
      {
        title: "Supervised Learning Algorithms",
        lessons: [
          { title: "Linear and Logistic Regression" },
          { title: "Decision Trees and Random Forests" },
          { title: "Support Vector Machines (SVM)" },
          { title: "Model Evaluation Metrics" }
        ]
      },
      {
        title: "Unsupervised Learning & Deep Learning Basics",
        lessons: [
          { title: "K-Means Clustering and PCA" },
          { title: "Introduction to Artificial Neural Networks" },
          { title: "Activation Functions and Backpropagation" },
          { title: "Building Models with TensorFlow/Keras" }
        ]
      },
      {
        title: "Advanced ML & Deployment",
        lessons: [
          { title: "Convolutional Neural Networks (CNN)" },
          { title: "Natural Language Processing (NLP) Basics" },
          { title: "Hyperparameter Tuning and Cross-Validation" },
          { title: "Deploying ML Models to Production" }
        ]
      }
    ]
  },
  cooking: {
    modules: [
      {
        title: "Culinary Fundamentals",
        lessons: [
          { title: "Kitchen Safety and Essential Tools" },
          { title: "Mastering Knife Skills and Cuts" },
          { title: "Understanding Flavor Profiles and Balancing" },
          { title: "Food Safety and Storage Guidelines" }
        ]
      },
      {
        title: "Core Cooking Techniques",
        lessons: [
          { title: "Sautéing, Searing, and Pan-Frying" },
          { title: "Roasting and Baking Principles" },
          { title: "Boiling, Simmering, and Poaching" },
          { title: "Grilling and Broiling Methods" }
        ]
      },
      {
        title: "Stocks, Sauces, and Soups",
        lessons: [
          { title: "Making Foundational Broths and Stocks" },
          { title: "The Five French Mother Sauces" },
          { title: "Creating Emulsions and Vinaigrettes" },
          { title: "Crafting Cream and Clear Soups" }
        ]
      },
      {
        title: "Plating and Advanced Preparation",
        lessons: [
          { title: "Meat, Poultry, and Seafood Preparation" },
          { title: "Vegetable and Grain Cooking" },
          { title: "Artistic Plating and Presentation" },
          { title: "Menu Planning and Meal Prep Strategies" }
        ]
      }
    ]
  },
  fitness: {
    modules: [
      {
        title: "Fitness Fundamentals",
        lessons: [
          { title: "Understanding Macronutrients and Nutrition" },
          { title: "Goal Setting and Tracking Progress" },
          { title: "Anatomy Basics for Exercise" },
          { title: "Warm-ups, Stretching, and Mobility" }
        ]
      },
      {
        title: "Strength and Resistance Training",
        lessons: [
          { title: "Core Compound Movements (Squat, Deadlift, Bench)" },
          { title: "Isolation Exercises and Muscle Hypertrophy" },
          { title: "Bodyweight Training and Calisthenics" },
          { title: "Progressive Overload Principles" }
        ]
      },
      {
        title: "Cardiovascular and Endurance Training",
        lessons: [
          { title: "HIIT vs. LISS Cardio" },
          { title: "Running and Cycling Fundamentals" },
          { title: "Improving VO2 Max and Stamina" },
          { title: "Integrating Cardio with Weight Training" }
        ]
      },
      {
        title: "Recovery and Advanced Programming",
        lessons: [
          { title: "The Importance of Sleep and Hydration" },
          { title: "Active Recovery and Injury Prevention" },
          { title: "Designing a Split Routine" },
          { title: "Periodization and Breaking Plateaus" }
        ]
      }
    ]
  },
  dance: {
    modules: [
      {
        title: "Rhythm and Fundamentals",
        lessons: [
          { title: "Understanding Musicality and Timing" },
          { title: "Basic Posture and Frame" },
          { title: "Weight Transfer and Balance" },
          { title: "Fundamental Steps and Footwork" }
        ]
      },
      {
        title: "Coordination and Movement",
        lessons: [
          { title: "Body Isolations and Control" },
          { title: "Arm Styling and Extension" },
          { title: "Turns, Spins, and Spotting Techniques" },
          { title: "Traveling Across the Floor" }
        ]
      },
      {
        title: "Partnering and Connection",
        lessons: [
          { title: "Lead and Follow Principles" },
          { title: "Tension and Handholds" },
          { title: "Executing Basic Partner Turns" },
          { title: "Spatial Awareness and Floor Craft" }
        ]
      },
      {
        title: "Expression and Performance",
        lessons: [
          { title: "Adding Flavor and Personal Style" },
          { title: "Choreography Retention" },
          { title: "Facial Expressions and Emotion" },
          { title: "Performance Readiness and Confidence" }
        ]
      }
    ]
  },
  photography: {
    modules: [
      {
        title: "Camera Basics and Exposure",
        lessons: [
          { title: "Understanding the Exposure Triangle" },
          { title: "Mastering Aperture and Depth of Field" },
          { title: "Shutter Speed and Motion Blur" },
          { title: "ISO, Noise, and Sensor Mechanics" }
        ]
      },
      {
        title: "Composition and Lighting",
        lessons: [
          { title: "Rule of Thirds and Leading Lines" },
          { title: "Framing and Perspective" },
          { title: "Understanding Natural Light and Golden Hour" },
          { title: "Introduction to Artificial Lighting and Flash" }
        ]
      },
      {
        title: "Genres and Techniques",
        lessons: [
          { title: "Portrait Photography and Posing" },
          { title: "Landscape and Architecture Strategies" },
          { title: "Macro and Product Photography" },
          { title: "Street Photography and Candid Shots" }
        ]
      },
      {
        title: "Post-Processing and Editing",
        lessons: [
          { title: "Introduction to Lightroom and Raw Files" },
          { title: "Color Correction and Grading" },
          { title: "Retouching and Local Adjustments" },
          { title: "Exporting for Print vs. Web" }
        ]
      }
    ]
  },
  general: {
    modules: [
      {
        title: "Fundamentals and Core Principles",
        lessons: [
          { title: "Introduction and Key Definitions" },
          { title: "Historical Context and Evolution" },
          { title: "Basic Concepts and Terminology" },
          { title: "Setting the Foundation for Mastery" }
        ]
      },
      {
        title: "Techniques and Methodologies",
        lessons: [
          { title: "Essential Tools and Frameworks" },
          { title: "Standard Practices and Workflows" },
          { title: "Problem Solving and Strategy" },
          { title: "Applying Concepts to Real Scenarios" }
        ]
      },
      {
        title: "Advanced Concepts and Applications",
        lessons: [
          { title: "Deep Dive into Complex Topics" },
          { title: "Integration and Compatibility" },
          { title: "Optimization and Efficiency" },
          { title: "Case Studies and Critical Analysis" }
        ]
      },
      {
        title: "Mastery and Future Trends",
        lessons: [
          { title: "Evaluating Quality and Outcomes" },
          { title: "Adapting to Industry Changes" },
          { title: "Leadership and Best Practices" },
          { title: "Final Review and Next Steps" }
        ]
      }
    ]
  }
};

const getRoadmapForDomain = (domain) => {
  return roadmaps[domain] || roadmaps['general'];
};

module.exports = { getRoadmapForDomain };
