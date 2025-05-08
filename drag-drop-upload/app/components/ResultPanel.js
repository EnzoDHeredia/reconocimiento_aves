import { getPrettyClassName, getGenero } from './utils';

export default function ResultPanel({ result, loading }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px]">
        <svg className="animate-spin" width="64" height="64" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#4CAF50" strokeWidth="6" opacity="0.2"/><path d="M12 2a10 10 0 0 1 10 10" stroke="#4CAF50" strokeWidth="6" strokeLinecap="round"/></svg>
        <span className="text-green-700 font-semibold mt-4 text-2xl">Procesando imagen...</span>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="mt-4 bg-white/95 border-4 border-green-400 rounded-3xl shadow-2xl p-10 flex flex-col gap-4">
      <div className="flex items-center gap-4 mb-4">
        <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><path fill="#4CAF50" d="M2 20l2-2h16l2 2v1H2v-1zm2-2V4a2 2 0 012-2h12a2 2 0 012 2v14H4zm2-2h12V4H6v12z"/></svg>
        <span className="text-4xl font-extrabold text-green-800 drop-shadow-lg">{getPrettyClassName(result.class)}</span>
        {getGenero(result.class) && (
          <span className="ml-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-2xl font-bold shadow">{getGenero(result.class)}</span>
        )}
      </div>
      {result.confidence !== undefined && (
        <div className="flex items-center gap-3">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#FFEB3B" strokeWidth="4"/><path d="M12 6v6l4 2" stroke="#FFEB3B" strokeWidth="3" strokeLinecap="round"/></svg>
          <span className="text-yellow-700 font-bold text-xl">Confianza: {(result.confidence * 100).toFixed(2)}%</span>
        </div>
      )}
      {result.ebird_info ? (
        <div className="mt-4 flex flex-col gap-3 text-2xl">
          <div className="flex items-center gap-3">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="#2196F3" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/></svg>
            <span className="text-green-900"><b>Nombre común:</b> {result.ebird_info.comName}</span>
          </div>
          <div className="flex items-center gap-3">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="#2196F3" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/></svg>
            <span className="italic text-green-900"><b>Nombre científico:</b> {result.ebird_info.sciName}</span>
          </div>
          <div className="flex items-center gap-3">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="#4CAF50" d="M12 2a10 10 0 1 1 0 20 10 10 10 0 0 1 0-20zm0 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/></svg>
            <span className="text-green-900"><b>Familia:</b> {result.ebird_info.familyComName}</span>
          </div>
          <div className="flex items-center gap-3">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="#4CAF50" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/></svg>
            <span className="text-green-900"><b>Orden:</b> {result.ebird_info.order}</span>
          </div>
          <div className="flex items-center gap-3">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="#FFEB3B" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/></svg>
            <span className="text-green-900"><b>Categoría:</b> {result.ebird_info.category}</span>
          </div>
        </div>
      ) : (
        <p className="text-red-600 mt-6 text-2xl">No se encontró información en eBird.</p>
      )}
    </div>
  );
}
