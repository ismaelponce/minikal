import React, { useState } from 'react';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const EnhancedCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [notes, setNotes] = useState({});
  const [currentNote, setCurrentNote] = useState('');

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setCurrentNote('');
  };

  const handleAddNote = () => {
    if (selectedDate && currentNote.trim() !== '') {
      const dateKey = formatDate(selectedDate);
      setNotes(prevNotes => ({
        ...prevNotes,
        [dateKey]: [...(prevNotes[dateKey] || []), currentNote]
      }));
      setCurrentNote('');
    }
  };

  const handleDeleteNote = (dateKey, index) => {
    setNotes(prevNotes => {
      const updatedNotes = { ...prevNotes };
      updatedNotes[dateKey] = updatedNotes[dateKey].filter((_, i) => i !== index);
      if (updatedNotes[dateKey].length === 0) {
        delete updatedNotes[dateKey];
      }
      return updatedNotes;
    });
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = daysInMonth[0].getDay();
  const blanks = Array(firstDayOfMonth).fill(null);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="text-gray-600 hover:text-gray-800">
          ←
        </button>
        <h2 className="text-xl font-light">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={handleNextMonth} className="text-gray-600 hover:text-gray-800">
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-4">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center font-light text-gray-500">
            {day}
          </div>
        ))}
        {blanks.map((_, index) => (
          <div key={`blank-${index}`} className="text-center p-2"></div>
        ))}
        {daysInMonth.map(date => {
          const dateKey = formatDate(date);
          const isSelected = selectedDate && formatDate(selectedDate) === dateKey;
          const hasNotes = notes[dateKey] && notes[dateKey].length > 0;
          return (
            <button
              key={dateKey}
              onClick={() => handleDateClick(date)}
              className={`text-center p-2 rounded-full hover:bg-gray-100 ${
                isSelected ? 'bg-gray-200' : ''
              } ${hasNotes ? 'font-bold' : ''}`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
      {selectedDate && (
        <div className="mt-4">
          <h3 className="text-lg font-light mb-2">
            Notes for {selectedDate.toLocaleDateString()}
          </h3>
          <div className="flex mb-2">
            <input
              type="text"
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              className="flex-grow p-2 border rounded-l-md"
              placeholder="Enter a note..."
            />
            <button
              onClick={handleAddNote}
              className="bg-gray-200 text-gray-800 px-4 rounded-r-md hover:bg-gray-300"
            >
              Add
            </button>
          </div>
          <ul className="space-y-2">
            {notes[formatDate(selectedDate)]?.map((note, index) => (
              <li key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                <span>{note}</span>
                <button
                  onClick={() => handleDeleteNote(formatDate(selectedDate), index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EnhancedCalendar;