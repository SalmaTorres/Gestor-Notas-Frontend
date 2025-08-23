import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './componentes/sidebar/sidebar.component';
import { BoardComponent } from './componentes/board/board.component';

interface Note {
  color: string;
  top: number;
  left: number;
  text: string;
}

@Component({
  selector: 'app-root',
  imports: [SidebarComponent, BoardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'notas';
  createdNotes: Note[] = [];

  onNoteCreated(color: string) {
    const top = Math.floor(Math.random() * 500);
    const left = Math.floor(Math.random() * 700);

    this.createdNotes.push({
      color,
      top,
      left,
      text: ''
    });
  }
}