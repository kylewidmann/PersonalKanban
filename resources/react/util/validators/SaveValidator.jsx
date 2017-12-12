import store from '../../app/index';

export default class SaveValidator{

  constructor(){
    this.data = {};
    this.error = null;
  }

  validateItemSave = (item) => {

    this.error = null;
    this.data = {};

    const { categories } = store.getState();

    const oneDay = 24*60*60*1000;

    const currDate = new Date();
    currDate.setHours(0,0,0,0);
    const endDate = new Date(item.due_date);
    endDate.setHours(0,0,0,0);
    const totalDays = Math.round((endDate.getTime() - currDate.getTime())/(oneDay)) + 1;
    const startDay = currDate.getDay();

    const dayOccurrencesInRange = new Array(7);
    dayOccurrencesInRange.fill(0);

    for(let day = startDay; day < startDay + 7; day++){
      let index = day % 7;
      dayOccurrencesInRange[index] = Math.floor((totalDays - 1 - day + startDay) / 7) + 1;
    }

    this.data.category = categories.filter(category => category.id === item.category_id)[0];
    this.data.totalDaysWithTimeAllotted = dayOccurrencesInRange.reduce((prev, curr) => prev + curr);
    this.data.totalCategoryTime = this.data.category.hours.reduce((sum, hours, index) => sum + (hours * dayOccurrencesInRange[index]), 0);
    this.data.avgCategoryTime = this.data.totalCategoryTime / this.data.totalDaysWithTimeAllotted;
    this.data.itemTotalTime = parseInt(item.estimated_time_hours) + parseInt(item.estimated_time_minutes)/60;
    const timesInRange = this.data.category.hours.filter((hour, index) => dayOccurrencesInRange[index] !== 0 );
    this.data.maxCategoryTime = timesInRange.reduce((prev, curr) => Math.max(prev, curr));

    if(!this.categoryHasEnoughTime()){
      return false;
    }if(!this.canFitItemIntoSchedule(item)){
      return false;
    }else if(this.needToSplitItem()){
      return false;
    }else if(this.shouldSplitItem()){
      return false;
    }

    return true;

  };

  needToSplitItem = () => {

    if(this.data.itemTotalTime > this.data.maxCategoryTime){
      this.error = 'NEED_SPLIT';
      return true;
    }

    return false;
  };

  shouldSplitItem = () => {

    if(this.data.itemTotalTime > this.data.avgCategoryTime){
      this.error = 'SHOULD_SPLIT';
      return true;
    }

    return false;
  };

  //ToDo: revise checking to see if enough time exists in category first, then if enough available time
  categoryHasEnoughTime = () => {

    if(this.data.itemTotalTime > this.data.totalCategoryTime){
      this.error = 'CAN_NOT_FIT';
      return false;
    }
    return true;
  };


  canFitItemIntoSchedule = (item, items = store.getState().items) => {

    const sameCategoryItems = items.filter(otherItem => {
      return (
        otherItem.id !== item.id &&
        otherItem.category_id === item.category_id &&
        new Date(otherItem.due_date).setHours(0,0,0,0) <= new Date(item.due_date).setHours(0,0,0,0)
      )
    });

    const usedCategoryTime = sameCategoryItems.reduce((sum, item) => sum + (parseInt(item.estimated_time.split(":")[0]) + parseInt(item.estimated_time.split(":")[1])/60), 0);
    this.data.availableTime = this.data.totalCategoryTime - usedCategoryTime;

    if(this.data.itemTotalTime > this.data.availableTime){
      this.error = 'ITEMS_CONFLICT';
      return false;
    }

    return true;
  };
}
