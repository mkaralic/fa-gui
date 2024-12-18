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
    const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let currentChunk = 0;

    const uploadChunk = (start: number): Promise<any> => {
      return new Promise((resolve, reject) => {
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('file', chunk, file.name);
        formData.append('chunkIndex', currentChunk.toString());
        formData.append('totalChunks', totalChunks.toString());

        this.http.post('http://localhost:5000/upload', formData).subscribe({
          next: () => {
            currentChunk++;
            const progress = Math.round((currentChunk / totalChunks) * 100);
            this.socket.emit('status', { status: 'upload_progress', progress });

            if (currentChunk < totalChunks) {
              resolve(uploadChunk(end));
            } else {
              resolve('Upload complete');
            }
          },
          error: (err) => reject(err),
        });
      });
    };

    return new Observable(observer => {
      uploadChunk(0)
        .then(() => {
          observer.next({ status: 'upload_completed' });
          observer.complete();
        })
        .catch(error => {
          observer.error({ status: 'upload_failed', error });
        });
    });
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
