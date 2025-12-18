import React, { useState, useEffect } from 'react';
import { createSuggestion } from '../../apis/suggestions';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useDarkModeStore from '../../store/useDarkModeStore';

const SuggestionModal = ({ isOpen, onClose, type, initialData = null }) => {
  const axiosPrivate = useAxiosPrivate();
  const isDark = useDarkModeStore((state) => state.isDark);
  
  // Utility class for input fields
  const inputClass = `w-full px-4 py-3 border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'} rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all`;
  const labelClass = `block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`;
  
  const [formData, setFormData] = useState({
    type: type || 'ADD_KANJI',
    kanji: '',
    hanViet: '',
    onyomi: '',
    kunyomi: '',
    joyoReading: '',
    word: '',
    reading: '',
    hiragana: '',
    meaning: '',
    reason: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        type: type || 'ADD_KANJI',
        kanji: initialData?.kanji || '',
        hanViet: initialData?.hanViet || '',
        onyomi: initialData?.onyomi || '',
        kunyomi: initialData?.kunyomi || '',
        joyoReading: initialData?.joyoReading || '',
        word: initialData?.word || '',
        reading: initialData?.reading || '',
        hiragana: initialData?.hiragana || '',
        meaning: initialData?.meaning || '',
        reason: ''
      });
      setError('');
      setSuccess(false);
    }
  }, [isOpen, type, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createSuggestion(axiosPrivate, formData);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  const getTitle = () => {
    switch (formData.type) {
      case 'ADD_KANJI':
        return 'Đề xuất thêm Kanji mới';
      case 'ADD_COMPOUND':
        return 'Đề xuất thêm từ ghép mới';
      case 'CORRECTION':
        return 'Báo lỗi / Đề xuất sửa đổi';
      default:
        return 'Gửi yêu cầu';
    }
  };

  const getIconColor = () => {
    switch (formData.type) {
      case 'ADD_KANJI':
        return 'from-slate-500 to-rose-400';
      case 'ADD_COMPOUND':
        return 'from-slate-500 to-rose-400';
      case 'CORRECTION':
        return 'from-slate-600 to-rose-500';
      default:
        return 'from-slate-500 to-gray-500';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10001] p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-2xl w-full my-8`}>
        <div className={`px-6 py-4 rounded-t-2xl bg-gradient-to-r ${getIconColor()}`}>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-white text-3xl">
              {formData.type === 'ADD_KANJI' ? 'translate' : 
               formData.type === 'ADD_COMPOUND' ? 'menu_book' : 'flag'}
            </span>
            <h2 className="text-xl font-bold text-white">{getTitle()}</h2>
          </div>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-6xl text-green-500 mb-4 inline-block">
              check_circle
            </span>
            <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-2`}>Gửi yêu cầu thành công!</h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Admin sẽ xem xét và phản hồi sớm nhất.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]">
            {/* Scrollable content */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined">error</span>
                  <span>{error}</span>
                </div>
              )}

            {/* Type selector - chỉ hiện khi không có initialData */}
            {!initialData && (
              <div>
                <label className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Loại yêu cầu <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['ADD_KANJI', 'ADD_COMPOUND', 'CORRECTION'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({...formData, type: t})}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.type === t
                          ? 'border-slate-500 bg-slate-50 dark:bg-slate-700'
                          : isDark ? 'border-gray-600 hover:border-gray-500 bg-gray-700' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-2xl mb-2 block ${isDark ? 'text-gray-300' : ''}`}>
                        {t === 'ADD_KANJI' ? 'translate' : t === 'ADD_COMPOUND' ? 'menu_book' : 'flag'}
                      </span>
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : ''}`}>
                        {t === 'ADD_KANJI' ? 'Thêm Kanji' : t === 'ADD_COMPOUND' ? 'Thêm từ ghép' : 'Báo lỗi'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Kanji fields - chỉ hiện khi type là ADD_KANJI */}
            {formData.type === 'ADD_KANJI' && (
              <div className={`space-y-4 ${isDark ? 'bg-slate-800' : 'bg-slate-50'} p-4 rounded-xl`}>
                <h3 className={`font-semibold ${isDark ? 'text-gray-300' : 'text-slate-700'} flex items-center gap-2`}>
                  <span className="material-symbols-outlined">translate</span>
                  Thông tin Kanji
                </h3>
                <div>
                  <label className={labelClass}>
                    Kanji <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="kanji"
                    value={formData.kanji}
                    onChange={handleChange}
                    className={`${inputClass} text-2xl text-center focus:ring-slate-500`}
                    placeholder="例: 漢"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>
                      Hán Việt
                    </label>
                    <input
                      type="text"
                      name="hanViet"
                      value={formData.hanViet}
                      onChange={handleChange}
                      className={`${inputClass} focus:ring-purple-500`}
                      placeholder="例: Hán"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Onyomi (音読み)
                    </label>
                    <input
                      type="text"
                      name="onyomi"
                      value={formData.onyomi}
                      onChange={handleChange}
                      className={`${inputClass} focus:ring-slate-500`}
                      placeholder="例: カン"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>
                    Kunyomi (訓読み)
                  </label>
                  <input
                    type="text"
                    name="kunyomi"
                    value={formData.kunyomi}
                    onChange={handleChange}
                    className={`${inputClass} focus:ring-slate-500`}
                    placeholder="例: から"
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Joyo Reading (常用読み方)
                  </label>
                  <input
                    type="text"
                    name="joyoReading"
                    value={formData.joyoReading}
                    onChange={handleChange}
                    className={`${inputClass} focus:ring-slate-500`}
                    placeholder="例: カン, から"
                  />
                </div>
              </div>
            )}

            {/* Compound fields - chỉ hiện khi type là ADD_COMPOUND */}
            {formData.type === 'ADD_COMPOUND' && (
              <div className={`space-y-4 ${isDark ? 'bg-rose-900/30' : 'bg-rose-50'} p-4 rounded-xl`}>
                <h3 className={`font-semibold ${isDark ? 'text-rose-400' : 'text-rose-700'} flex items-center gap-2`}>
                  <span className="material-symbols-outlined">menu_book</span>
                  Thông tin từ ghép
                </h3>
                <div>
                  <label className={labelClass}>
                    Từ ghép <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="word"
                    value={formData.word}
                    onChange={handleChange}
                    className={`${inputClass} text-2xl text-center focus:ring-rose-400`}
                    placeholder="例: 日本語"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>
                      Reading (Romaji)
                    </label>
                    <input
                      type="text"
                      name="reading"
                      value={formData.reading}
                      onChange={handleChange}
                      className={`${inputClass} focus:ring-rose-400`}
                      placeholder="例: nihongo"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Hiragana
                    </label>
                    <input
                      type="text"
                      name="hiragana"
                      value={formData.hiragana}
                      onChange={handleChange}
                      className={`${inputClass} focus:ring-rose-400`}
                      placeholder="例: にほんご"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Correction fields - chỉ hiện field có trong database */}
            {formData.type === 'CORRECTION' && (
              <div className={`space-y-4 ${isDark ? 'bg-slate-800' : 'bg-slate-50'} p-4 rounded-xl`}>
                <h3 className={`font-semibold ${isDark ? 'text-gray-300' : 'text-slate-700'} flex items-center gap-2`}>
                  <span className="material-symbols-outlined">flag</span>
                  Thông tin cần sửa đổi
                </h3>
                
                {initialData?.kanji && (
                  <>
                    <div>
                      <label className={labelClass}>
                        Kanji hiện tại
                      </label>
                      <div className={`px-4 py-3 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-white border-gray-300 text-gray-500'} border rounded-xl text-2xl text-center`}>
                        {initialData.kanji}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>
                          Hán Việt mới (nếu cần sửa)
                        </label>
                        <input
                          type="text"
                          name="hanViet"
                          value={formData.hanViet}
                          onChange={handleChange}
                          className={`${inputClass} focus:ring-slate-500`}
                          placeholder="Để trống nếu không sửa"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>
                          Onyomi mới (nếu cần sửa)
                        </label>
                        <input
                          type="text"
                          name="onyomi"
                          value={formData.onyomi}
                          onChange={handleChange}
                          className={`${inputClass} focus:ring-slate-500`}
                          placeholder="Để trống nếu không sửa"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>
                          Kunyomi mới (nếu cần sửa)
                        </label>
                        <input
                          type="text"
                          name="kunyomi"
                          value={formData.kunyomi}
                          onChange={handleChange}
                          className={`${inputClass} focus:ring-slate-500`}
                          placeholder="Để trống nếu không sửa"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>
                          Joyo Reading mới (nếu cần sửa)
                        </label>
                        <input
                          type="text"
                          name="joyoReading"
                          value={formData.joyoReading}
                          onChange={handleChange}
                          className={`${inputClass} focus:ring-slate-500`}
                          placeholder="Để trống nếu không sửa"
                        />
                      </div>
                    </div>
                  </>
                )}
                
                {initialData?.word && (
                  <>
                    <div>
                      <label className={labelClass}>
                        Từ ghép hiện tại
                      </label>
                      <div className={`px-4 py-3 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-white border-gray-300 text-gray-500'} border rounded-xl text-2xl text-center`}>
                        {initialData.word}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>
                          Hiragana mới (nếu cần sửa)
                        </label>
                        <input
                          type="text"
                          name="hiragana"
                          value={formData.hiragana}
                          onChange={handleChange}
                          className={`${inputClass} focus:ring-rose-400`}
                          placeholder="Để trống nếu không sửa"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>
                          Reading mới (nếu cần sửa)
                        </label>
                        <input
                          type="text"
                          name="reading"
                          value={formData.reading}
                          onChange={handleChange}
                          className={`${inputClass} focus:ring-rose-400`}
                          placeholder="Để trống nếu không sửa"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className={labelClass}>
                          Nghĩa mới (nếu cần sửa)
                        </label>
                        <input
                          type="text"
                          name="meaning"
                          value={formData.meaning}
                          onChange={handleChange}
                          className={`${inputClass} focus:ring-rose-400`}
                          placeholder="Để trống nếu không sửa"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Common fields - chỉ cho ADD mode, không cho CORRECTION */}
            {formData.type !== 'CORRECTION' && (
              <div>
                <label className={labelClass}>
                  Nghĩa (tiếng Việt)
                </label>
                <input
                  type="text"
                  name="meaning"
                  value={formData.meaning}
                  onChange={handleChange}
                  className={`${inputClass} focus:ring-slate-500`}
                  placeholder="例: Tiếng Nhật"
                />
              </div>
            )}

            <div>
              <label className={labelClass}>
                Lý do / Giải thích <span className="text-red-500">*</span>
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows="4"
                className={`${inputClass} focus:ring-slate-500 resize-none`}
                placeholder="Vui lòng cho biết lý do bạn muốn thêm/sửa từ này..."
                required
              />
            </div>
            </div>

            {/* Fixed buttons at bottom */}
            <div className={`sticky bottom-0 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t p-6 flex gap-3`}>
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 px-6 py-3 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} font-semibold rounded-xl transition-colors`}
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className={`flex-1 px-6 py-3 font-semibold rounded-xl transition-all bg-gradient-to-r ${getIconColor()} text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">send</span>
                    Gửi yêu cầu
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SuggestionModal;
