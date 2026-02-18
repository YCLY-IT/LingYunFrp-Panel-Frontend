const DB_NAME = 'LingYunFrpPanelDB'
const DB_VERSION = 1
const STORE_NAME = 'images'
const MAX_STORAGE_SIZE = 50 * 1024 * 1024

let dbInstance: IDBDatabase | null = null

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error('无法打开 IndexedDB'))
    }

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' })
      }
    }
  })
}

export const saveImageToIndexedDB = async (
  key: string,
  data: string,
): Promise<void> => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put({ key, data, timestamp: Date.now() })

    request.onsuccess = () => resolve()
    request.onerror = () => reject(new Error('保存图片到 IndexedDB 失败'))
  })
}

export const getImageFromIndexedDB = async (
  key: string,
): Promise<string | null> => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(key)

    request.onsuccess = () => {
      resolve(request.result?.data || null)
    }
    request.onerror = () => reject(new Error('从 IndexedDB 读取图片失败'))
  })
}

export const deleteImageFromIndexedDB = async (key: string): Promise<void> => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(key)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(new Error('从 IndexedDB 删除图片失败'))
  })
}

export interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSizeKB?: number
}

export interface CompressResult {
  data: string
  originalSize: number
  compressedSize: number
  width: number
  height: number
}

export const compressImage = async (
  file: File,
  options: CompressOptions = {},
): Promise<CompressResult> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    maxSizeKB = 500,
  } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        let width = img.width
        let height = img.height
        const originalSize = file.size

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('无法创建 canvas 上下文'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        let currentQuality = quality
        let compressedBase64 = canvas.toDataURL('image/jpeg', currentQuality)
        let compressedSize = Math.round((compressedBase64.length * 3) / 4)

        const maxAttempts = 5
        let attempts = 0

        while (compressedSize > maxSizeKB * 1024 && attempts < maxAttempts) {
          currentQuality *= 0.8
          compressedBase64 = canvas.toDataURL('image/jpeg', currentQuality)
          compressedSize = Math.round((compressedBase64.length * 3) / 4)
          attempts++
        }

        if (compressedSize > MAX_STORAGE_SIZE) {
          width = Math.round(width * 0.7)
          height = Math.round(height * 0.7)
          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)
          compressedBase64 = canvas.toDataURL('image/jpeg', 0.6)
          compressedSize = Math.round((compressedBase64.length * 3) / 4)
        }

        resolve({
          data: compressedBase64,
          originalSize,
          compressedSize,
          width,
          height,
        })
      }

      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsDataURL(file)
  })
}

export const preloadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('图片加载失败'))

    img.src = url
  })
}

export const getImageSize = async (
  url: string,
): Promise<{ width: number; height: number; size?: number }> => {
  const img = await preloadImage(url)
  return {
    width: img.width,
    height: img.height,
  }
}

export const compressNetworkImage = async (
  url: string,
  options: CompressOptions = {},
): Promise<CompressResult> => {
  const img = await preloadImage(url)

  const canvas = document.createElement('canvas')
  let width = img.width
  let height = img.height

  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    maxSizeKB = 500,
  } = options

  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height)
    width = Math.round(width * ratio)
    height = Math.round(height * ratio)
  }

  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('无法创建 canvas 上下文')
  }

  ctx.drawImage(img, 0, 0, width, height)

  let currentQuality = quality
  let compressedBase64 = canvas.toDataURL('image/jpeg', currentQuality)
  let compressedSize = Math.round((compressedBase64.length * 3) / 4)

  const maxAttempts = 5
  let attempts = 0

  while (compressedSize > maxSizeKB * 1024 && attempts < maxAttempts) {
    currentQuality *= 0.8
    compressedBase64 = canvas.toDataURL('image/jpeg', currentQuality)
    compressedSize = Math.round((compressedBase64.length * 3) / 4)
    attempts++
  }

  return {
    data: compressedBase64,
    originalSize: 0,
    compressedSize,
    width,
    height,
  }
}

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

export const BACKGROUND_IMAGE_KEY = 'app-background-image-v2'

export const saveBackgroundImage = async (imageData: string): Promise<void> => {
  try {
    await saveImageToIndexedDB(BACKGROUND_IMAGE_KEY, imageData)
    localStorage.setItem('app-background-image-meta', 'indexeddb')
  } catch (error) {
    console.warn('IndexedDB 存储失败，回退到 localStorage:', error)
    if (imageData.length < 2 * 1024 * 1024) {
      localStorage.setItem('app-background-image-fallback', imageData)
      localStorage.setItem('app-background-image-meta', 'localstorage')
    } else {
      throw new Error('图片太大，无法存储。请使用更小的图片。')
    }
  }
}

export const loadBackgroundImage = async (): Promise<string | null> => {
  try {
    const meta = localStorage.getItem('app-background-image-meta')

    if (meta === 'indexeddb') {
      const data = await getImageFromIndexedDB(BACKGROUND_IMAGE_KEY)
      return data
    } else if (meta === 'localstorage') {
      return localStorage.getItem('app-background-image-fallback')
    }

    const legacyData = localStorage.getItem('app-background-image')
    if (legacyData) {
      await saveBackgroundImage(legacyData)
      localStorage.removeItem('app-background-image')
      return legacyData
    }

    return null
  } catch (error) {
    console.error('加载背景图失败:', error)
    return null
  }
}

export const clearBackgroundImage = async (): Promise<void> => {
  try {
    await deleteImageFromIndexedDB(BACKGROUND_IMAGE_KEY)
  } catch (error) {
    console.warn('从 IndexedDB 删除失败:', error)
  }
  localStorage.removeItem('app-background-image-fallback')
  localStorage.removeItem('app-background-image-meta')
  localStorage.removeItem('app-background-image')
}
