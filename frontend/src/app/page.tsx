import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-gray-900">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-blue-600">AI ATS Analyzer</h1>
        <div className="flex gap-4">
          <button className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50">Log In</button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Pane: Input */}
        <div className="w-1/3 bg-white border-r p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">1. Job Details</h2>
          <textarea 
            className="w-full h-32 p-3 border rounded-md mb-6 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-800"
            placeholder="Paste Job Description here..."
          />
          
          <h2 className="text-lg font-semibold mb-4 text-gray-800">2. Your Resume</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 mb-4 cursor-pointer hover:bg-gray-100 transition-colors">
            <span className="text-sm text-gray-600 font-medium">Upload PDF or DOCX</span>
          </div>
          <div className="text-center text-sm text-gray-400 font-medium mb-4">OR</div>
          <button className="w-full py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 shadow-sm transition-all">
            Build with AI Chat
          </button>
        </div>

        {/* Middle Pane: Analysis */}
        <div className="w-1/3 bg-gray-50 border-r p-6 overflow-y-auto flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-8 self-start text-gray-800">Analysis Insights</h2>
          
          {/* Circular Score Mock */}
          <div className="w-32 h-32 rounded-full border-8 border-blue-500 flex items-center justify-center mb-10 bg-white shadow-sm">
            <span className="text-3xl font-extrabold text-blue-600">75</span>
          </div>

          <div className="w-full gap-4 flex flex-col flex-1">
            <div>
                <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Missing Skills</h3>
                <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-xs font-bold border border-red-200 shadow-sm">Docker</span>
                <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-xs font-bold border border-red-200 shadow-sm">Kubernetes</span>
                </div>
            </div>

            <div className="mt-4">
                <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Matched Skills</h3>
                <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md text-xs font-bold border border-green-200 shadow-sm">Python</span>
                <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md text-xs font-bold border border-green-200 shadow-sm">React</span>
                </div>
            </div>
          </div>
          
          <button className="mt-8 w-full py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 shadow-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            Auto-Optimize Resume
          </button>
        </div>

        {/* Right Pane: Preview */}
        <div className="w-1/3 bg-white p-6 overflow-y-auto relative bg-gray-100/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Live Preview</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium rounded shadow transition-colors">PDF</button>
              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded shadow transition-colors">Word</button>
            </div>
          </div>
          <div className="w-full bg-white rounded border border-gray-200 aspect-[1/1.4] p-8 shadow-sm">
             {/* Mock document layout */}
             <div className="h-4 bg-gray-800 w-3/4 mb-4 rounded"></div>
             <div className="h-3 bg-gray-400 w-1/2 mb-8 rounded"></div>
             
             <div className="h-3 bg-gray-200 w-full mb-3 rounded"></div>
             <div className="h-3 bg-gray-200 w-full mb-3 rounded"></div>
             <div className="h-3 bg-gray-200 w-5/6 mb-8 rounded"></div>

             <div className="h-3 bg-gray-300 w-1/3 mb-4 rounded"></div>
             <div className="h-3 bg-gray-200 w-full mb-3 rounded"></div>
             <div className="h-3 bg-gray-200 w-11/12 mb-3 rounded"></div>
          </div>
        </div>
      </main>
    </div>
  );
}
