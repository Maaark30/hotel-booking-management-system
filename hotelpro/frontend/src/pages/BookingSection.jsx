useEffect(() => {
    getRooms({ status: 'available' }).then(setRooms).catch(() => {});
  }, []);

  useEffect(() => {
    function handleRoomSelected() {
      const roomId = sessionStorage.getItem('selectedRoomId');
      if (roomId) {
        setFormData((prev) => ({ ...prev, roomId }));
        sessionStorage.removeItem('selectedRoomId');
      }
    }
    window.addEventListener('roomSelected', handleRoomSelected);
    // Also check on mount in case user just logged in and returned
    handleRoomSelected();
    return () => window.removeEventListener('roomSelected', handleRoomSelected);
  }, []);