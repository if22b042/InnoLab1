import { Component, OnInit } from '@angular/core';
import { TestingService } from '../Testing/testing.service';

interface AverageResult {
  average: number;
  max: number;
  min: number;
}

@Component({
  selector: 'app-test-run',
  templateUrl: './test-run.component.html',
  styleUrls: ['./test-run.component.css'] // Assuming you have styles defined
})
export class TestRunComponent implements OnInit {
  finalResults?: any[];  // Adjust to handle latitude and longitude
  averageResults?: AverageResult[];  // Adjusted to handle structured average results

  constructor(private testingService: TestingService) {}

  ngOnInit() {
    this.runLocationTests();
  }

  runLocationTests() {
    const numberOfLocations = 300;  
    this.testingService.testRandomLocations(numberOfLocations).subscribe({
      next: (result) => {
        this.finalResults = result.finalResults;
        this.averageResults = result.averageResults;
      },
      error: (error) => {
        console.error('Error while fetching location tests:', error);
      }
    });
  }
}
