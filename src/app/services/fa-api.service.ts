import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FaApiService {
  constructor(private http: HttpClient, private socket: Socket) { }

  getFileList(): Observable<{ files: string[] }> {
    return this.http.get<{ files: string[] }>('http://localhost:5000/files');
  }

  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post('http://localhost:5000/upload', formData);
  }

  downloadFileUrl(fileName: string): string {
    return `http://localhost:5000/download/${fileName}`;
  }

  onStatusUpdate(): Observable<any> {
    return this.socket.fromEvent('status');
  }

  onFileListUpdated(): Observable<any> {
    return this.socket.fromEvent('file_list_updated');
  }
}
