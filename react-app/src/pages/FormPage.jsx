import '../App.css';
import AddRuleForm from "../components/rulesForm";
import AddApiForm from "../components/apiForm";
import AddInputDataForm from "../components/inputForm";
import ApisList from "../components/ApisList";
import InputDataList from "../components/InputDataList";
import AutomationRulesList from "../components/automationRulesList";

function App() {
    return (
        <div className="App">
            <h1>Forms </h1>
            <AddApiForm/>
            <AddInputDataForm/>
            <AddRuleForm/>
            <ApisList/>
            <InputDataList/>
            <AutomationRulesList/>
        </div>
    );
}

export default App;
