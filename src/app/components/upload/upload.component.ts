import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MlService } from '../../services/ml.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  file?: File;
  uploading = false;
  errorMessage = '';

  @Output() ingredientsDetected = new EventEmitter<string[]>();

  constructor(private mlService: MlService) {}

  onFileSelected(event: any) {
    const f = event.target.files?.[0];
    if (f) {
      if (f.size > 10 * 1024 * 1024) {
        this.errorMessage = 'File too large! Maximum size is 10MB.';
        return;
      }
      this.file = f;
      this.errorMessage = '';
    }
  }

  upload() {
    if (!this.file) return;

    this.uploading = true;
    this.errorMessage = '';

    this.mlService.detectFood(this.file).subscribe({
      next: (data) => {
        this.uploading = false;

        const ingredient = data.ingredient;
        if (ingredient) this.ingredientsDetected.emit([ingredient]);
        else this.errorMessage = 'No ingredient found.';
      },
      error: (err) => {
        this.uploading = false;
        this.errorMessage = 'Image processing failed.';
        console.error('Upload error:', err);
      }
    });
  }
}
