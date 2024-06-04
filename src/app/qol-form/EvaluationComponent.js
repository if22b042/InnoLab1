class EvaluationComponent {
    constructor() {
      this.policeStationsCount = 0; // This should be assigned from your data fetching logic
      this.unemploymentRate = 0; // This should be assigned similarly
      this.income = 0; // And this one too
  
      // Example data fetched or defined somewhere
      this.policeStats = { avg: 2.1, max: 11, min: 0 };
      this.hospitalStats = { avg: 2.29, max: 9, min: 0 };
      this.schoolStats = { avg: 3.77, max: 16, min: 0 };
      this.greenSpaceStats = { avg: 90.96, max: 183, min: 23 };
      this.unemploymentStats = { avg: 89.91, max: 123, min: 32 };
      this.incomeStats = { avg: 25000, max: 37250, min: 20866 };
    }
  
    calculatePoints() {
      this.policePoints = this.calculateAttributePoints(this.policeStationsCount, this.policeStats);
      this.hospitalPoints = this.calculateAttributePoints(this.hospitalCount, this.hospitalStats);
      this.schoolPoints = this.calculateAttributePoints(this.schoolCount, this.schoolStats);
      this.greenSpacePoints = this.calculateAttributePoints(this.greenSpaceArea, this.greenSpaceStats);
  
      // Special handling for unemployment and income
      this.unemploymentPoints = this.calculateUnemploymentPoints(this.unemploymentRate, this.unemploymentStats);
      this.incomePoints = this.calculateAttributePoints(this.income, this.incomeStats);
  
      console.log("Police points: ", this.policePoints);
      console.log("Unemployment points: ", this.unemploymentPoints);
    }
  
    calculateAttributePoints(value, stats) {
      let normalized = (value - stats.avg) / (stats.max - stats.min);
      return 45 * normalized - 10;
    }
  
    calculateUnemploymentPoints(value, stats) {
      let normalized = 1 - (value - stats.avg) / (stats.max - stats.min);
      return 45 * normalized - 10;
    }
  }