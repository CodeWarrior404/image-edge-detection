import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageFrameComponent } from './image-frame.component';

describe('ImageFrameComponent', () => {
  let component: ImageFrameComponent;
  let fixture: ComponentFixture<ImageFrameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageFrameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageFrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
