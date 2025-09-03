import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Note {
  idNote?: string;
  content: string;
  positionX?: number;
  positionY?: number;
  category?: Category;
}

export interface Category {
  categoryId: string; 
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private apiUrl = 'http://localhost:8080/api/notes';
  private categoriesApiUrl = 'http://localhost:8080/api/categories';

  constructor(private http: HttpClient) {}

  createNote(note: Note | {
    content: string;
    color: string;      
    category: string;   
    positionX?: number;
    positionY?: number;
  }): Observable<any> {
    return this.http.post<any>(this.apiUrl, note);
  }

  getAllNotes(): Observable<Note[]> {
    return this.http.get<Note[]>(this.apiUrl);
  }

  searchAndFilterNotes(categoryId?: string, search?: string): Observable<Note[]> {
    let params = new HttpParams();
    if (categoryId) {
      params = params.set('categoryId', categoryId);
    }
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<Note[]>(this.apiUrl, { params });
  }

  getNotesByCategory(categoryId: string): Observable<Note[]> {
    return this.http.get<Note[]>(this.apiUrl, { 
      params: { categoryId: categoryId } 
    });
  }

  updateNote(id: string, note: Note): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, note);
  }
  
  deleteNote(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoriesApiUrl);
  }

  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(this.categoriesApiUrl, category);
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete<any>(`${this.categoriesApiUrl}/${id}`);
  }
}
