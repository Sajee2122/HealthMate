export class HealthRecord {
  id?: number;
  date: string;
  steps: number;
  calories: number;
  water: number;

  constructor(
    date: string = '',
    steps: number = 0,
    calories: number = 0,
    water: number = 0,
    id?: number
  ) {
    this.id = id;
    this.date = date;
    this.steps = steps;
    this.calories = calories;
    this.water = water;
  }
}