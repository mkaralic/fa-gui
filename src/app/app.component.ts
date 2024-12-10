import { Component, OnInit } from '@angular/core';
import { FaApiService } from './services/fa-api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  fileList: string[] = [];
  selectedFile: File | null = null;
  uploadProgress: number = 0;
  uploadStatus: string = '';

  constructor(private faApiService: FaApiService) { }

  ngOnInit(): void {
    this.getFileList();
    this.listenToEvents();
  }

  getFileList(): void {
    this.faApiService.getFileList().subscribe(response => {
      this.fileList = response.files;
    });
  }

  listenToEvents(): void {
    this.faApiService.onStatusUpdate().subscribe((data: any) => {
      if (data.status === 'upload_progress') {
        this.uploadProgress = data.progress;
      } else if (data.status === 'upload_completed') {
        this.uploadStatus = 'Upload completed successfully!';
        this.getFileList();
      } else if (data.status === 'upload_failed') {
        this.uploadStatus = 'Upload failed!';
      }
    });

    this.faApiService.onFileListUpdated().subscribe(() => {
      this.getFileList();
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  uploadFile(): void {
    if (this.selectedFile) {
      this.faApiService.uploadFile(this.selectedFile).subscribe({
        next: () => {
          this.uploadStatus = 'Uploading...';
        },
        error: () => {
          this.uploadStatus = 'File upload failed!';
        }
      });
    }
  }

  downloadFile(fileName: string): void {
    const url = this.faApiService.downloadFileUrl(fileName);
    window.open(url, '_blank');
  }
}