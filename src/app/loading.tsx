export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-black mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">⌚</span>
          </div>
        </div>
        <p className="mt-6 text-gray-600 font-medium">Carregando...</p>
      </div>
    </div>
  )
}

