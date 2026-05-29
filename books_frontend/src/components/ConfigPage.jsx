// books_frontend/src/components/ConfigPage.jsx
import React, { useState, useEffect, useRef } from 'react';

function ConfigPage() {
  const [books, setBooks] = useState([]);
  const [groups, setGroups] = useState([]); // [{group_name, image_url}]
  const [bookGroups, setBookGroups] = useState({});
  const [newGroupName, setNewGroupName] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileInputRefs = useRef({});

  const showStatus = (message, isError = false) => {
    setStatusMessage({ message, isError });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      fetch('http://localhost:8000/books').then(r => r.json()),
      fetch('http://localhost:8000/get_existing_groups').then(r => r.json()),
      fetch('http://localhost:8000/get_book_groups').then(r => r.json()),
    ])
      .then(([booksData, groupsData, bookGroupsData]) => {
        setBooks(booksData);
        setGroups(groupsData);
        const map = {};
        bookGroupsData.forEach(({ book, group_name }) => {
          map[book] = group_name;
        });
        setBookGroups(map);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading config data:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCreateGroup = () => {
    const name = newGroupName.trim();
    if (!name) return;

    fetch(`http://localhost:8000/create_group?group=${encodeURIComponent(name)}`, { method: 'POST' })
      .then(r => {
        if (!r.ok) return r.json().then(d => Promise.reject(d.detail));
        return r.json();
      })
      .then(() => {
        setGroups(prev => [...prev, { group_name: name, image_url: null }]);
        setNewGroupName('');
        showStatus(`Group "${name}" created.`);
      })
      .catch(err => showStatus(typeof err === 'string' ? err : 'Failed to create group.', true));
  };

  const handleDeleteGroup = (groupName) => {
    fetch(`http://localhost:8000/delete_group?group=${encodeURIComponent(groupName)}`, { method: 'DELETE' })
      .then(r => {
        if (!r.ok) return r.json().then(d => Promise.reject(d.detail));
        return r.json();
      })
      .then(() => {
        setGroups(prev => prev.filter(g => g.group_name !== groupName));
        setBookGroups(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(book => {
            if (updated[book] === groupName) delete updated[book];
          });
          return updated;
        });
        showStatus(`Group "${groupName}" deleted.`);
      })
      .catch(err => showStatus(typeof err === 'string' ? err : 'Failed to delete group.', true));
  };

  const handleUploadImage = (groupName, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    fetch(`http://localhost:8000/upload_group_image?group=${encodeURIComponent(groupName)}`, {
      method: 'POST',
      body: formData,
    })
      .then(r => {
        if (!r.ok) return r.json().then(d => Promise.reject(d.detail));
        return r.json();
      })
      .then(({ image_url }) => {
        setGroups(prev => prev.map(g =>
          g.group_name === groupName ? { ...g, image_url } : g
        ));
        showStatus(`Image updated for "${groupName}".`);
      })
      .catch(err => showStatus(typeof err === 'string' ? err : 'Failed to upload image.', true));
  };

  const handleAssignGroup = (book, group) => {
    fetch(`http://localhost:8000/set_book_group?vessel=${encodeURIComponent(book)}&group=${encodeURIComponent(group)}`, { method: 'POST' })
      .then(r => {
        if (!r.ok) return r.json().then(d => Promise.reject(d.detail));
        return r.json();
      })
      .then(() => {
        setBookGroups(prev => ({ ...prev, [book]: group }));
        showStatus(`"${book}" assigned to "${group}".`);
      })
      .catch(err => showStatus(typeof err === 'string' ? err : 'Failed to assign group.', true));
  };

  return (
    <div className="app-container">
      <h1 className="config-page-title">Configuration</h1>

      {statusMessage && (
        <div className={`config-status ${statusMessage.isError ? 'config-status--error' : 'config-status--success'}`}>
          {statusMessage.message}
        </div>
      )}

      {/* Book Series Section */}
      <section className="config-section">
        <h2 className="config-section-title">Book Series</h2>

        {groups.length === 0 ? (
          <p className="config-empty">No book series yet.</p>
        ) : (
          <table className="config-table config-groups-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Book Series</th>
                <th>Upload Image</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {groups.map(({ group_name, image_url }) => (
                <tr key={group_name}>
                  <td>
                    {image_url
                      ? <img src={image_url} alt={group_name} className="config-group-thumb" />
                      : <div className="config-group-thumb config-group-thumb--placeholder" />
                    }
                  </td>
                  <td>{group_name}</td>
                  <td>
                    <input
                      ref={el => fileInputRefs.current[group_name] = el}
                      type="file"
                      accept="image/*"
                      className="config-file-input"
                      onChange={e => {
                        handleUploadImage(group_name, e.target.files[0]);
                        e.target.value = '';
                      }}
                    />
                  </td>
                  <td>
                    <button
                      className="config-btn config-btn--danger"
                      onClick={() => handleDeleteGroup(group_name)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="config-create-group">
          <input
            type="text"
            className="config-input"
            placeholder="New group name"
            value={newGroupName}
            onChange={e => setNewGroupName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreateGroup()}
          />
          <button className="config-btn" onClick={handleCreateGroup} disabled={!newGroupName.trim()}>
            Create New Series
          </button>
        </div>
      </section>

      {/* Book Assignments Section */}
      <section className="config-section">
        <h2 className="config-section-title">Assign Books to Series</h2>

        {loading ? (
          <p className="config-empty">Loading...</p>
        ) : (
          <table className="config-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Series</th>
              </tr>
            </thead>
            <tbody>
              {books.map(({ title }) => (
                <tr key={title}>
                  <td>{title}</td>
                  <td>
                    <select
                      className="config-select"
                      value={bookGroups[title] || ''}
                      onChange={e => handleAssignGroup(title, e.target.value)}
                    >
                      <option value="" disabled>— select series —</option>
                      {groups.map(({ group_name }) => (
                        <option key={group_name} value={group_name}>{group_name}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default ConfigPage;

