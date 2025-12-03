import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-side-bar',
  imports: [ CommonModule],
  templateUrl: './admin-side-bar.component.html',
  styleUrl: './admin-side-bar.component.css'
})
export class AdminSideBarComponent {
  @Input() open: boolean = true;
  @Output() openChange = new EventEmitter<boolean>();

  constructor( private router: Router) { }

  toggleSidebar() {
    this.open = !this.open;
    this.openChange.emit(this.open);
  }

  food(){
    this.router.navigate(['admin/food'])
  }

  user(){
    this.router.navigate(['admin/user'])
  }

  order(){
    this.router.navigate(['admin/order'])
  }
  
  promotion(){
    this.router.navigate(['admin/promotion'])
  }

  review(){
    this.router.navigate(['admin/review'])
  }
}
