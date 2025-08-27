import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Note {
  idNote?: string;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private apiUrl = 'http://localhost:8080/api/notes';

  constructor(private http: HttpClient) {}

  createNote(note: Note): Observable<any> {
    return this.http.post<any>(this.apiUrl, note);
  }

  getAllNotes(): Observable<Note[]> {
    return this.http.get<Note[]>(this.apiUrl);
  }

  updateNote(id: string, note: Note): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, note);
  }
  
  deleteNote(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
