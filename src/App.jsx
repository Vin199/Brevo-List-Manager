import React, { useState } from 'react';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const BrevoListManager = () => {
  // List data with names and IDs
  const lists = [
    { name: 'Employees', id: 87 },
    { name: 'Website', id: 89 },
    { name: 'CSR', id: 90 },
    { name: 'NGO', id: 91 },
  ];

  // Form data state - separate for each list
  const [formData, setFormData] = useState(
    lists.reduce((acc, list) => ({
      ...acc,
      [list.id]: { firstName: '', lastName: '', email: '' }
    }), {})
  );

  // Loading states for each list
  const [loadingStates, setLoadingStates] = useState({});

  // Selected list for mobile view
  const [selectedListId, setSelectedListId] = useState(lists[0].id);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // API Key from environment variables
  const API_KEY = import.meta.env.VITE_BREVO_API_KEY;

  // Handle input changes
  const handleInputChange = (listId, field, value) => {
    setFormData(prev => ({
      ...prev,
      [listId]: {
        ...prev[listId],
        [field]: value
      }
    }));
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // Reset form for specific list
  const resetForm = (listId) => {
    setFormData(prev => ({
      ...prev,
      [listId]: { firstName: '', lastName: '', email: '' }
    }));
  };

  // Validate email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Subscribe to list
  const handleSubscribe = async (listId, listName) => {
    const data = formData[listId];
    
    // Validation
    if (!data.email.trim()) {
      showToast('Email Id is required', 'error');
      return;
    }

    if (!isValidEmail(data.email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    if (!API_KEY) {
      showToast('API key not configured. Please check your .env file.', 'error');
      return;
    }

    setLoadingStates(prev => ({ ...prev, [listId]: true }));

    try {
      //Brevo API endpoint for creating a contact and adding to a list
      const response = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': API_KEY
        },
        body: JSON.stringify({
          updateEnabled: false, // Only add new contacts, don't update existing ones
          email: data.email.trim(),
          attributes: {
            FIRSTNAME: data.firstName.trim(),
            LASTNAME: data.lastName.trim()
          },
          listIds: [listId], // Add to specific list
          emailBlacklisted: false,
          smsBlacklisted: false
        })
      });

      if (response.ok || response.status === 201) {
        resetForm(listId);
        showToast(`Successfully added contact to ${listName} list!`, 'success');
      } else {
        const errorData = await response.json();
        showToast(errorData.message || `Failed to add contact to ${listName}`, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, [listId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
          Ayushi's Email Subscription Page
        </h1>

        {/* Toast Notification - Mobile optimized */}
        {toast.show && (
          <div className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto p-4 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="text-sm sm:text-base">{toast.message}</span>
          </div>
        )}

        {/* Desktop Table View - Hidden on mobile */}
        <div className="hidden lg:block bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">List Name (ID)</th>
                  <th className="px-6 py-4 text-left font-semibold">First Name</th>
                  <th className="px-6 py-4 text-left font-semibold">Last Name</th>
                  <th className="px-6 py-4 text-left font-semibold">Email</th>
                  <th className="px-6 py-4 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {lists.map((list, index) => (
                  <tr key={list.id} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {list.name} ({list.id})
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        placeholder="First Name"
                        value={formData[list.id].firstName}
                        onChange={(e) => handleInputChange(list.id, 'firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loadingStates[list.id]}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={formData[list.id].lastName}
                        onChange={(e) => handleInputChange(list.id, 'lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loadingStates[list.id]}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={formData[list.id].email}
                        onChange={(e) => handleInputChange(list.id, 'email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loadingStates[list.id]}
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleSubscribe(list.id, list.name)}
                        disabled={loadingStates[list.id]}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                      >
                        {loadingStates[list.id] ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          'Subscribe'
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View - Visible on mobile and tablet */}
        <div className="lg:hidden space-y-6">
          {/* List Selector Dropdown */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select List to Add Contact
            </label>
            <select
              value={selectedListId}
              onChange={(e) => setSelectedListId(parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white"
            >
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name} (ID: {list.id})
                </option>
              ))}
            </select>
          </div>

          {/* Selected List Form */}
          {(() => {
            const selectedList = lists.find(list => list.id === selectedListId);
            return (
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                {/* List Header */}
                <div className="mb-4 pb-3 border-b border-gray-200">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    Add Contact to {selectedList.name}
                  </h2>
                  <p className="text-sm text-gray-500">List ID: {selectedList.id}</p>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter first name"
                      value={formData[selectedList.id].firstName}
                      onChange={(e) => handleInputChange(selectedList.id, 'firstName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      disabled={loadingStates[selectedList.id]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter last name"
                      value={formData[selectedList.id].lastName}
                      onChange={(e) => handleInputChange(selectedList.id, 'lastName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      disabled={loadingStates[selectedList.id]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={formData[selectedList.id].email}
                      onChange={(e) => handleInputChange(selectedList.id, 'email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      disabled={loadingStates[selectedList.id]}
                    />
                  </div>

                  {/* Subscribe Button */}
                  <button
                    onClick={() => handleSubscribe(selectedList.id, selectedList.name)}
                    disabled={loadingStates[selectedList.id]}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
                  >
                    {loadingStates[selectedList.id] ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Adding to {selectedList.name}...
                      </>
                    ) : (
                      <>
                        Subscribe to {selectedList.name}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default BrevoListManager;