import{Statistic,type StatisticProps}from'./data-display.js';
import{ContentTransition}from'./content-transition.js';
export type AnimatedStatisticProps=Omit<StatisticProps,'descriptor'> & Readonly<{descriptor:Omit<StatisticProps['descriptor'],'value'>;value:number;locale:string;format?:Intl.NumberFormatOptions;animated?:boolean}>;
/** Native presents a short whole-statistic transition; Intl and Statistic own the final spoken value. */
export function AnimatedStatistic({descriptor,value,locale,format,animated=true,...props}:AnimatedStatisticProps){
 if(!Number.isFinite(value))throw new TypeError('AnimatedStatistic value must be finite');
 const text=new Intl.NumberFormat(locale,format).format(value);
 // Reuse the existing reduced-motion/AppState-aware transition instead of introducing
 // a second number engine or announcing intermediate counts as real product data.
 return <ContentTransition stateKey={text} preset="rise" motion={animated?'system':'none'}><Statistic {...props} descriptor={{...descriptor,value:text}}/></ContentTransition>;
}
