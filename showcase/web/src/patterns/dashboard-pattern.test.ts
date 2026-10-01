import{expect,it}from"vitest";import{summarizeDashboard}from"../../../shared/dashboard-pattern";
it("derives summary and heatmap from the same filtered records",()=>{
 const month=summarizeDashboard("month"),week=summarizeDashboard("week"),empty=summarizeDashboard("empty");
 expect(month).toMatchObject({count:7,minutes:125,activeDays:6});expect(week).toMatchObject({count:4,minutes:80,activeDays:3});
 for(const data of [month,week,empty])expect(data.heatmap.days.reduce((sum,day)=>sum+day.value,0)).toBe(data.count);
 expect(week.heatmap.days).toHaveLength(7);expect(empty.heatmap.days).toHaveLength(31);expect(empty).toMatchObject({count:0,minutes:0,activeDays:0});
});
