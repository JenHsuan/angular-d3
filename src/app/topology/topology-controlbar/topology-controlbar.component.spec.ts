import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopologyControlbarComponent } from './topology-controlbar.component';

describe('TopologyControlbarComponent', () => {
  let component: TopologyControlbarComponent;
  let fixture: ComponentFixture<TopologyControlbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopologyControlbarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopologyControlbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
