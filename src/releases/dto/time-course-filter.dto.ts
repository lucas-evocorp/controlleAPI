export enum timeCourseEnum {
  MONTH = 'month',
  DAY = 'day',
  WEEK = 'week',
}

export class timeCourseFilterDto {
  timeCourseFilter: timeCourseEnum;
}
