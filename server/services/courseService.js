const generateCourseContent = (topic) => {
    console.log("Generating course for:", topic);

    const course = {
        title: `Course on ${topic}`,
        description: `This is a course about ${topic}`,
        modules: [
            {
                title: "Introduction",
                lessons: [
                    "What is it?",
                    "Why is it important?"
                ]
            },
            {
                title: "Basics",
                lessons: [
                    "Core concepts",
                    "Examples"
                ]
            }
        ]
    };

    return course;
};

module.exports = { generateCourseContent };