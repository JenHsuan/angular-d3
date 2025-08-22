import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopologyDisplayControllerComponent } from './topology-display-controller.component';

describe('TopologyDisplayControllerComponent', () => {
  let component: TopologyDisplayControllerComponent;
  let fixture: ComponentFixture<TopologyDisplayControllerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopologyDisplayControllerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopologyDisplayControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
