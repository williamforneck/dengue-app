import moment from "moment";

export const DATE_FORMAT = "DD/MM/YYYY HH:mm:ss";

export interface DateInfo {
  createdAt: Date;
  updatedAt: Date;
}

export const getDateInfo = (isOnlyUpdate = false) => {
  const date = moment().subtract("3", "hour").toDate();
  if (isOnlyUpdate) {
    return {
      updatedAt: date,
    };
  }

  return {
    createdAt: date,
    updatedAt: date,
  };
};
