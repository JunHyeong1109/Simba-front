import DatePick from "./Date/datePick";
import RewardCount from "./Reward/rewardCount";
import "./App.css";
import SelectShop from "./SelectShop/Select";
import EventPoaster from "./EventPoaster/EventPoaster";
import EventTitle from "./EventTitle/EventTitle";
import EventContent from "./EventContents/EventContent";

function App() {
  return (
    <div>
      <div>
        <h1>
          리뷰이벤트 생성
        </h1>
        <hr />
      </div>
      <div>
        <EventTitle />
      </div>
      <h1></h1>
      <div className="app-row2">
        <div className="app-row">
          <DatePick />
          <RewardCount />
          <SelectShop />
        </div>
      </div>
      <h1></h1>
      <div>
      </div>
      <h1></h1>
      <div>
        <EventContent/>
      </div>
    </div>
  );
}

export default App;
