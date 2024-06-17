import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopologyControlbarGroupComponent } from './topology-controlbar-group.component';

describe('TopologyControlbarGroupComponent', () => {
  let component: TopologyControlbarGroupComponent;
  let fixture: ComponentFixture<TopologyControlbarGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopologyControlbarGroupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopologyControlbarGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
