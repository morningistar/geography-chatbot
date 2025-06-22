import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

export function GeographyChat() {
  const [question, setQuestion] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  
  const chatHistory = useQuery(api.geography.getChatHistory);
  const topics = useQuery(api.geography.getGeographyTopics);
  const askQuestion = useAction(api.geography.askGeographyQuestion);
  const initializeTopics = useMutation(api.geography.initializeTopics);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, currentResponse]);

  useEffect(() => {
    // Initialize topics if they don't exist
    if (topics && topics.length === 0) {
      initializeTopics();
    }
  }, [topics, initializeTopics]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    setCurrentResponse("");
    
    try {
      const response = await askQuestion({
        question: question.trim(),
        topic: selectedTopic || undefined,
        difficulty: selectedDifficulty,
      });
      
      setCurrentResponse(response);
      setQuestion("");
      toast.success("Question answered!");
    } catch (error) {
      toast.error("Failed to get answer. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicClick = (topicName: string, sampleQuestion: string) => {
    setSelectedTopic(topicName);
    setQuestion(sampleQuestion);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Topics Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            📚 Geography Topics
          </h3>
          <div className="space-y-3">
            {topics?.map((topic) => (
              <div key={topic._id} className="border rounded-lg p-3 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm text-gray-800">{topic.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    topic.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                    topic.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {topic.difficulty}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-2">{topic.description}</p>
                <div className="space-y-1">
                  {topic.sampleQuestions.slice(0, 2).map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTopicClick(topic.name, question)}
                      className="text-xs text-blue-600 hover:text-blue-800 block text-left hover:underline"
                    >
                      • {question}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-sm border flex flex-col h-[600px]">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory?.slice().reverse().map((chat) => (
              <div key={chat._id} className="space-y-3">
                <div className="flex justify-end">
                  <div className="bg-blue-500 text-white rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                    <p className="text-sm">{chat.message}</p>
                    {chat.topic && (
                      <p className="text-xs opacity-75 mt-1">Topic: {chat.topic}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">🌍</span>
                      <span className="text-xs font-medium text-gray-600">Geography AI</span>
                    </div>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{chat.response}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Current Response */}
            {currentResponse && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🌍</span>
                    <span className="text-xs font-medium text-gray-600">Geography AI</span>
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{currentResponse}</p>
                </div>
              </div>
            )}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌍</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex gap-2">
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Topics</option>
                  {topics?.map((topic) => (
                    <option key={topic._id} value={topic.name}>
                      {topic.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask any geography question..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!question.trim() || isLoading}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? "..." : "Ask"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
