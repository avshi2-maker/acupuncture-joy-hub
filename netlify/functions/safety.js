
exports.handler = async function(event, context) {
    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "ALIVE! Bun was the problem." })
    };
};
