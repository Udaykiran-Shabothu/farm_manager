// Google Drive Cloud Database Sync Service for Samagra Farm Manager
// Uses Google Drive API v3 to store samagra_farm_database.json in user's 1 TB Drive space

const FOLDER_NAME = "Samagra_Farm_Manager_Cloud_DB";
const FILE_NAME = "samagra_farm_database.json";

// Initialize Google OAuth Token Client
export const initGoogleOAuth = (clientId, onTokenReceived, onError) => {
  if (!window.google || !window.google.accounts) {
    if (onError) onError("Google Identity Services SDK not loaded.");
    return null;
  }

  try {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/drive.file',
      callback: (response) => {
        if (response.access_token) {
          if (onTokenReceived) onTokenReceived(response.access_token);
        } else if (onError) {
          onError("Failed to obtain Google token.");
        }
      },
    });
    return client;
  } catch (err) {
    if (onError) onError(err.message);
    return null;
  }
};

// Helper: Find or create target folder in Google Drive
const getOrCreateFolder = async (accessToken) => {
  const query = `name = '${FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const data = await res.json();

  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }

  // Create folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder'
    })
  });
  const newFolder = await createRes.json();
  return newFolder.id;
};

// Save Farm Data JSON directly to user's 1 TB Google Drive
export const saveToGoogleDrive = async (accessToken, farmData) => {
  const folderId = await getOrCreateFolder(accessToken);
  const query = `name = '${FILE_NAME}' and '${folderId}' in parents and trashed = false`;
  
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const searchData = await searchRes.json();

  const fileContent = JSON.stringify(farmData, null, 2);
  const existingFile = searchData.files && searchData.files.length > 0 ? searchData.files[0] : null;

  if (existingFile) {
    // Update existing file
    const updateRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: fileContent
    });
    return await updateRes.json();
  } else {
    // Upload new file inside folder
    const metadata = {
      name: FILE_NAME,
      mimeType: 'application/json',
      parents: [folderId]
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([fileContent], { type: 'application/json' }));

    const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form
    });
    return await uploadRes.json();
  }
};

// Fetch & Restore Farm Data JSON from user's 1 TB Google Drive
export const loadFromGoogleDrive = async (accessToken) => {
  const folderId = await getOrCreateFolder(accessToken);
  const query = `name = '${FILE_NAME}' and '${folderId}' in parents and trashed = false`;
  
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const searchData = await searchRes.json();

  if (!searchData.files || searchData.files.length === 0) {
    throw new Error("No backup database file found in Google Drive folder.");
  }

  const fileId = searchData.files[0].id;
  const fileRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  const importedFarmData = await fileRes.json();
  return importedFarmData;
};
