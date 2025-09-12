import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-side-bar',
  imports: [ CommonModule],
  templateUrl: './admin-side-bar.component.html',
  styleUrl: './admin-side-bar.component.css'
})
export class AdminSideBarComponent {
  @Input() open: boolean = true;
  @Output() openChange = new EventEmitter<boolean>();

  toggleSidebar() {
    this.open = !this.open;
    this.openChange.emit(this.open);
  }
}
