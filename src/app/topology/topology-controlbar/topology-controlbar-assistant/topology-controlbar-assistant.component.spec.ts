import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopologyControlbarAssistantComponent } from './topology-controlbar-assistant.component';

describe('TopologyControlbarAssistantComponent', () => {
  let component: TopologyControlbarAssistantComponent;
  let fixture: ComponentFixture<TopologyControlbarAssistantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopologyControlbarAssistantComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopologyControlbarAssistantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
