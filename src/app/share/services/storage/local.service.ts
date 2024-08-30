import { Injectable } from '@angular/core';
import { StorageService } from '@share/services/storage/storage.service';

@Injectable({
  providedIn: 'root'
})

export class LocalService {
  constructor(private storageService: StorageService) { }

  // Set the json data to local storage
  setLocalStorage(key: string, value: any) {
    this.storageService.secureStorage.setItem(key, value);
  }

  // Get the json value from local storage
  getLocalStorage(key: string) {
    try {
      return this.storageService.secureStorage.getItem(key);
    } catch (error) {
      this.storageService.secureStorage.clear()
      window.location.href = '/auth/login'
      // return null
    }
  }

  // Remove the json value from local storage
  removeLocalStorage(key: string) {
    return this.storageService.secureStorage.removeItem(key);
  }

  // Clear the local storage
  clearLocalStorage() {
      return this.storageService.secureStorage.clear();
  }
}