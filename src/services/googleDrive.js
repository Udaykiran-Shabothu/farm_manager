// Google Drive Cloud Database Sync Service for Samagra Farm Manager
// Uses Google Drive API v3 to store samagra_farm_database.json in user's 1 TB Drive space

const FILE_NAME = "samagra_farm_database.json";
export const DEFAULT_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "875088260458-2gjuitrthcm3eu38oc49sje449ehahh6.apps.googleusercontent.com";

// Initialize Google OAuth Token Client
export const initGoogleOAuth = (clientId, onTokenReceived, onError) => {
  if (!window.google || !window.google.accounts) {
    if (onError) onError("Google Identity Services SDK not loaded.");
    return null;
  }

  const activeClientId = clientId || DEFAULT_CLIENT_ID;

  try {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: activeClientId,
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

// Save Farm Data JSON directly to user's 1 TB Google Drive (Fail-Proof 2-Step Upload)
export const saveToGoogleDrive = async (accessToken, farmData) => {
  const query = `name = '${FILE_NAME}' and trashed = false`;
  
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!searchRes.ok) {
    const errObj = await searchRes.json().catch(() => ({}));
    throw new Error(errObj.error?.message || `Google Drive API Search Error (${searchRes.status})`);
  }

  const searchData = await searchRes.json();
  const fileContent = JSON.stringify(farmData, null, 2);
  const existingFile = searchData.files && searchData.files.length > 0 ? searchData.files[0] : null;

  let targetFileId = existingFile ? existingFile.id : null;

  if (!targetFileId) {
    // Step 1: Create file metadata
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: FILE_NAME,
        mimeType: 'application/json'
      })
    });

    const createData = await createRes.json();
    if (!createRes.ok || createData.error) {
      throw new Error(createData.error?.message || `Failed to create backup file metadata (${createRes.status})`);
    }

    targetFileId = createData.id;
  }

  // Step 2: Upload JSON file content directly via media PATCH
  const updateRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${targetFileId}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: fileContent
  });

  const updateResult = await updateRes.json();
  if (!updateRes.ok || updateResult.error) {
    throw new Error(updateResult.error?.message || `Failed to upload database content (${updateRes.status})`);
  }

  return updateResult;
};

// Fetch & Restore Farm Data JSON from user's 1 TB Google Drive
export const loadFromGoogleDrive = async (accessToken) => {
  const query = `name = '${FILE_NAME}' and trashed = false`;
  
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!searchRes.ok) {
    const errObj = await searchRes.json().catch(() => ({}));
    throw new Error(errObj.error?.message || `Google Drive API Search Error (${searchRes.status})`);
  }

  const searchData = await searchRes.json();

  if (!searchData.files || searchData.files.length === 0) {
    throw new Error("No backup database file found in Google Drive. Please click 'Backup to Google Drive' on your mobile phone first!");
  }

  const fileId = searchData.files[0].id;
  const fileRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!fileRes.ok) {
    const errObj = await fileRes.json().catch(() => ({}));
    throw new Error(errObj.error?.message || `Failed to download backup content (${fileRes.status})`);
  }

  const importedFarmData = await fileRes.json();
  return importedFarmData;
};
