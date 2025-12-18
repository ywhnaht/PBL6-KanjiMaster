import React, { useState, useEffect } from 'react';
import { createSuggestion } from '../../apis/suggestions';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';

const SuggestionModal = ({ isOpen, onClose, type, initialData = null }) => {
  const axiosPrivate = useAxiosPrivate();
  
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
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
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Gửi yêu cầu thành công!</h3>
            <p className="text-gray-600">Admin sẽ xem xét và phản hồi sớm nhất.</p>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                          ? 'border-slate-500 bg-slate-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="material-symbols-outlined text-2xl mb-2 block">
                        {t === 'ADD_KANJI' ? 'translate' : t === 'ADD_COMPOUND' ? 'menu_book' : 'flag'}
                      </span>
                      <span className="text-xs font-medium">
                        {t === 'ADD_KANJI' ? 'Thêm Kanji' : t === 'ADD_COMPOUND' ? 'Thêm từ ghép' : 'Báo lỗi'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Kanji fields - chỉ hiện khi type là ADD_KANJI */}
            {formData.type === 'ADD_KANJI' && (
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                  <span className="material-symbols-outlined">translate</span>
                  Thông tin Kanji
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kanji <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="kanji"
                    value={formData.kanji}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-2xl text-center"
                    placeholder="例: 漢"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hán Việt
                    </label>
                    <input
                      type="text"
                      name="hanViet"
                      value={formData.hanViet}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="例: Hán"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Onyomi (音読み)
                    </label>
                    <input
                      type="text"
                      name="onyomi"
                      value={formData.onyomi}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                      placeholder="例: カン"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kunyomi (訓読み)
                  </label>
                  <input
                    type="text"
                    name="kunyomi"
                    value={formData.kunyomi}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                    placeholder="例: から"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Joyo Reading (常用読み方)
                  </label>
                  <input
                    type="text"
                    name="joyoReading"
                    value={formData.joyoReading}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                    placeholder="例: カン, から"
                  />
                </div>
              </div>
            )}

            {/* Compound fields - chỉ hiện khi type là ADD_COMPOUND */}
            {formData.type === 'ADD_COMPOUND' && (
              <div className="space-y-4 bg-rose-50 p-4 rounded-xl">
                <h3 className="font-semibold text-rose-700 flex items-center gap-2">
                  <span className="material-symbols-outlined">menu_book</span>
                  Thông tin từ ghép
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Từ ghép <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="word"
                    value={formData.word}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all text-2xl text-center"
                    placeholder="例: 日本語"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reading (Romaji)
                    </label>
                    <input
                      type="text"
                      name="reading"
                      value={formData.reading}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
                      placeholder="例: nihongo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hiragana
                    </label>
                    <input
                      type="text"
                      name="hiragana"
                      value={formData.hiragana}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
                      placeholder="例: にほんご"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Correction fields - chỉ hiện field có trong database */}
            {formData.type === 'CORRECTION' && (
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                  <span className="material-symbols-outlined">flag</span>
                  Thông tin cần sửa đổi
                </h3>
                
                {initialData?.kanji && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kanji hiện tại
                      </label>
                      <div className="px-4 py-3 bg-white border border-gray-300 rounded-xl text-2xl text-center text-gray-500">
                        {initialData.kanji}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hán Việt mới (nếu cần sửa)
                        </label>
                        <input
                          type="text"
                          name="hanViet"
                          value={formData.hanViet}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                          placeholder="Để trống nếu không sửa"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Onyomi mới (nếu cần sửa)
                        </label>
                        <input
                          type="text"
                          name="onyomi"
                          value={formData.onyomi}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                          placeholder="Để trống nếu không sửa"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kunyomi mới (nếu cần sửa)
                        </label>
                        <input
                          type="text"
                          name="kunyomi"
                          value={formData.kunyomi}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                          placeholder="Để trống nếu không sửa"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Joyo Reading mới (nếu cần sửa)
                        </label>
                        <input
                          type="text"
                          name="joyoReading"
                          value={formData.joyoReading}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                          placeholder="Để trống nếu không sửa"
                        />
                      </div>
                    </div>
                  </>
                )}
                
                {initialData?.word && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Từ ghép hiện tại
                      </label>
                      <div className="px-4 py-3 bg-white border border-gray-300 rounded-xl text-2xl text-center text-gray-500">
                        {initialData.word}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hiragana mới (nếu cần sửa)
                        </label>
                        <input
                          type="text"
                          name="hiragana"
                          value={formData.hiragana}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
                          placeholder="Để trống nếu không sửa"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reading mới (nếu cần sửa)
                        </label>
                        <input
                          type="text"
                          name="reading"
                          value={formData.reading}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
                          placeholder="Để trống nếu không sửa"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nghĩa mới (nếu cần sửa)
                        </label>
                        <input
                          type="text"
                          name="meaning"
                          value={formData.meaning}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nghĩa (tiếng Việt)
                </label>
                <input
                  type="text"
                  name="meaning"
                  value={formData.meaning}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                  placeholder="例: Tiếng Nhật"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do / Giải thích <span className="text-red-500">*</span>
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all resize-none"
                placeholder="Vui lòng cho biết lý do bạn muốn thêm/sửa từ này..."
                required
              />
            </div>
            </div>

            {/* Fixed buttons at bottom */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
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
