import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import LogoutButton from './LogoutButton';
import UserDisplay from './UserDisplay';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const EnhancedCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [notes, setNotes] = useState({});
  const [currentNote, setCurrentNote] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchNotes(session.user);
      } else {
        setNotes({});
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchNotes(session.user);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchNotes = async (user) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const notesObject = data.reduce((acc, note) => {
        if (!acc[note.date]) {
          acc[note.date] = [];
        }
        acc[note.date].push({ id: note.id, content: note.content });
        return acc;
      }, {});

      setNotes(notesObject);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setError('Failed to fetch notes. Please try again.');
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
  };

  const formatDate = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
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
    setError(null);
  };

  const handleAddNote = async () => {
    if (selectedDate && currentNote.trim() !== '' && user) {
      const dateKey = formatDate(selectedDate);
      try {
        console.log('Adding note:', { user_id: user.id, date: dateKey, content: currentNote });
        const { data, error } = await supabase
          .from('notes')
          .insert({ user_id: user.id, date: dateKey, content: currentNote })
          .select();

        if (error) throw error;

        console.log('Note added successfully:', data);

        setNotes(prevNotes => ({
          ...prevNotes,
          [dateKey]: [...(prevNotes[dateKey] || []), { id: data[0].id, content: currentNote }]
        }));
        setCurrentNote('');
        setError(null);
      } catch (error) {
        console.error('Error adding note:', error);
        setError('Failed to add note. Please try again.');
      }
    }
  };

  const handleDeleteNote = async (dateKey, noteId) => {
    if (user) {
      try {
        const { error } = await supabase
          .from('notes')
          .delete()
          .eq('id', noteId)
          .eq('user_id', user.id);

        if (error) throw error;

        setNotes(prevNotes => {
          const updatedNotes = { ...prevNotes };
          updatedNotes[dateKey] = updatedNotes[dateKey].filter(note => note.id !== noteId);
          if (updatedNotes[dateKey].length === 0) {
            delete updatedNotes[dateKey];
          }
          return updatedNotes;
        });
        setError(null);
      } catch (error) {
        console.error('Error deleting note:', error);
        setError('Failed to delete note. Please try again.');
      }
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out. Please try again.');
    } else {
      setUser(null);
      setNotes({});
      setError(null);
    }
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const blanks = Array((firstDayOfMonth + 6) % 7).fill(null);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        {user && <UserDisplay user={user} />}
        <LogoutButton onLogout={handleLogout} />
      </div>
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
      {selectedDate && user && (
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
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <ul className="space-y-2">
            {notes[formatDate(selectedDate)]?.map((note) => (
              <li key={note.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                <span>{note.content}</span>
                <button
                  onClick={() => handleDeleteNote(formatDate(selectedDate), note.id)}
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