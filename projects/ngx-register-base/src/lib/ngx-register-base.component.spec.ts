import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxRegisterBaseComponent } from './ngx-register-base.component';

describe('NgxRegisterBaseComponent', () => {
  let component: NgxRegisterBaseComponent;
  let fixture: ComponentFixture<NgxRegisterBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxRegisterBaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxRegisterBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
