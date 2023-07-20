import {useLocation} from 'react-router-dom';
import {Typography} from '../../Components/Tailwind';
import {Breadcrumbs} from '../../Components/Tailwind/Breadcrumbs';
import Table from '../../Components/Tailwind/Table';
import {RegFormData} from '../../Models/EventData';

const RegistrationFormPage = () => {
  const {state: eventData}: {state: RegFormData} = useLocation(); // Get the state object passed from the previous page
  console.log('eventData:', eventData);

  return (
    <div className="mx-auto w-full h-full justify-center align-center mt-3">
      <div className="flex flex-row w-100 items-center justify-between">
        <Breadcrumbs className="ml-2" routeNames={[eventData.event.title, eventData.label]} />

        <Typography variant="body3" className="mr-2">
          {eventData.event.date}
        </Typography>
      </div>

      <Table
        columnLabels={['Attendees']}
        rows={[['Joao Mesquita'], ['John Doe']]}
        className="w-5/6 m-auto mt-6"
      />
    </div>
  );
};

export default RegistrationFormPage;