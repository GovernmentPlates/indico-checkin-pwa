import {ChangeEvent, useCallback, useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  UserIcon,
  BanknotesIcon,
} from '@heroicons/react/20/solid';
import BottomNav from '../../Components/BottomNav';
import GrowingTextArea from '../../Components/GrowingTextArea';
import IconFeather from '../../Components/Icons/Feather';
import {Typography} from '../../Components/Tailwind';
import IndicoLink from '../../Components/Tailwind/IndicoLink';
import Title from '../../Components/Tailwind/PageTitle';
import {CheckinToggle} from '../../Components/Tailwind/Toggle';
import TopNav from '../../Components/TopNav';
import db, {Event, Regform, Participant} from '../../db/db';
import {useErrorModal} from '../../hooks/useModal';
import useSettings from '../../hooks/useSettings';
import {useIsOffline} from '../../utils/client';
import {useQuery, isLoading, hasValue, DBResult} from '../../utils/db';
import {checkIn} from '../Events/checkin';
import {syncEvent, syncParticipant, syncRegform} from '../Events/sync';
import {NotFound} from '../NotFound';
import AccompanyingPersons from './AccompanyingPersons';
import {Field, Section, getAccompanyingPersons} from './fields';
import {PaymentWarning, markAsUnpaid} from './payment';
import {RegistrationState} from './RegistrationState';

const makeDebounce = (delay: number) => {
  let timer: number;
  return (fn: CallableFunction) => {
    clearTimeout(timer);
    timer = setTimeout(fn, delay);
  };
};

const debounce = makeDebounce(300);

export default function ParticipantPage() {
  const {id, regformId, participantId} = useParams();

  const event = useQuery(() => db.events.get(Number(id)), [id]);
  const regform = useQuery(
    () => db.regforms.get({id: Number(regformId), eventId: Number(id)}),
    [id, regformId]
  );
  const participant = useQuery(
    () => db.participants.get({id: Number(participantId), regformId: Number(regformId)}),
    [regformId, participantId]
  );

  const title = hasValue(participant) ? participant.fullName : '';

  return (
    <>
      <ParticipantTopNav event={event} regform={regform} participant={participant} />
      <ParticipantPageContent event={event} regform={regform} participant={participant} />
      <BottomNav backBtnText={title} />
    </>
  );
}

function ParticipantPageContent({
  event,
  regform,
  participant,
}: {
  event: DBResult<Event>;
  regform: DBResult<Regform>;
  participant: DBResult<Participant>;
}) {
  const navigate = useNavigate();
  const {state} = useLocation();
  const [autoCheckin, setAutoCheckin] = useState(state?.autoCheckin ?? false);
  const {id, regformId, participantId} = useParams();
  const {soundEffect} = useSettings();
  const offline = useIsOffline();
  const errorModal = useErrorModal();
  const [isCheckinLoading, setIsCheckinLoading] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // remove autoCheckin from location state
    if (state?.autoCheckin !== undefined) {
      const {autoCheckin, ...rest} = state || {};
      navigate('.', {replace: true, state: rest});
    }
  }, [navigate, state]);

  const performCheckin = useCallback(
    async (event: Event, regform: Regform, participant: Participant, newCheckinState: boolean) => {
      if (offline) {
        errorModal({title: 'You are offline', content: 'Check-in requires an internet connection'});
        return;
      }

      setIsCheckinLoading(true);
      try {
        await checkIn(event, regform, participant, newCheckinState, soundEffect, errorModal);
      } catch (err: any) {
        errorModal({title: 'Could not update check-in status', content: err.message});
      } finally {
        setIsCheckinLoading(false);
      }
    },
    [offline, errorModal, soundEffect]
  );

  useEffect(() => {
    const controller = new AbortController();

    async function sync() {
      const event = await db.events.get(Number(id));
      const regform = await db.regforms.get(Number(regformId));
      const participant = await db.participants.get(Number(participantId));
      if (!event || !regform || !participant) {
        return;
      }

      setAutoCheckin(false);
      if (autoCheckin && !participant.checkedIn) {
        await performCheckin(event, regform, participant, true);
      } else {
        await syncEvent(event, controller.signal, errorModal);
        await syncRegform(event, regform, controller.signal, errorModal);
        await syncParticipant(event, regform, participant, controller.signal, errorModal);
      }
    }

    sync().catch(err => {
      errorModal({title: 'Something went wrong when fetching updates', content: err.message});
    });

    return () => controller.abort();
  }, [id, regformId, participantId, errorModal, autoCheckin, offline, performCheckin]);

  useEffect(() => {
    if (hasValue(participant)) {
      setNotes(participant.notes);
    }
  }, [participant]);

  if (isLoading(event) || isLoading(regform) || isLoading(participant)) {
    return null;
  }

  if (!event) {
    return <NotFound text="Event not found" icon={<CalendarDaysIcon />} />;
  } else if (!regform) {
    return <NotFound text="Registration form not found" icon={<IconFeather />} />;
  } else if (!participant) {
    return <NotFound text="Participant not found" icon={<UserIcon />} />;
  }

  const onAddNotes = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    debounce(() => {
      db.participants.update(participant.id, {notes: e.target.value});
    });
  };

  const onCheckInToggle = async () => {
    if (!hasValue(event) || !hasValue(regform) || !hasValue(participant)) {
      return;
    }

    if (offline) {
      errorModal({title: 'You are offline', content: 'Check-in requires an internet connection'});
      return;
    }

    await performCheckin(event, regform, participant, !participant.checkedIn);
  };

  const registrationData = participant.registrationData.map((data: Section, i: number) => {
    const section: SectionProps = {
      ...data,
      isFirst: i === 0,
      isLast: i === participant.registrationData.length - 1,
      isUnique: participant.registrationData.length === 1,
    };

    return <RegistrationSection key={section.id} {...section} />;
  });

  return (
    <>
      <div className="px-4 pt-1">
        <div className="mt-2 flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2 px-4">
            <Title title={participant.fullName} />
            <IndicoLink
              text="Indico participant page"
              url={`${event.baseUrl}/event/${event.indicoId}/manage/registration/${regform.indicoId}/registrations/${participant.indicoId}`}
            />
            <div className="flex items-center gap-2">
              <RegistrationState state={participant.state} />
              {participant.price > 0 && (
                <span
                  className="w-fit rounded-full bg-purple-100 px-2.5 py-1 text-sm font-medium
                             text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                >
                  {participant.formattedPrice}
                </span>
              )}
            </div>
          </div>

          <div className="mb-4 mt-4 flex justify-center">
            <CheckinToggle
              checked={participant.checkedIn}
              isLoading={isCheckinLoading}
              onClick={onCheckInToggle}
            />
          </div>
          {participant.state === 'unpaid' && (
            <PaymentWarning
              event={event}
              regform={regform}
              participant={participant}
              errorModal={errorModal}
            />
          )}
          {participant.occupiedSlots > 1 && (
            <AccompanyingPersons persons={getAccompanyingPersons(participant.registrationData)} />
          )}
          <Typography as="div" variant="body1" className="mt-1 flex w-full justify-center">
            <GrowingTextArea value={notes} onChange={onAddNotes} />
          </Typography>
        </div>
      </div>
      <div className="mt-5 flex flex-col px-4">{registrationData}</div>
    </>
  );
}

function ParticipantTopNav({
  event,
  regform,
  participant,
}: {
  event: DBResult<Event>;
  regform: DBResult<Regform>;
  participant: DBResult<Participant>;
}) {
  const errorModal = useErrorModal();

  if (!hasValue(event) || !hasValue(regform) || !hasValue(participant)) {
    return <TopNav />;
  }

  if (participant.price === 0 || !participant.isPaid) {
    return <TopNav />;
  }

  return (
    <TopNav
      backBtnText={regform.title}
      settingsItems={[
        {
          text: 'Mark as unpaid',
          icon: <BanknotesIcon className="text-green-500" />,
          onClick: async () => {
            if (!hasValue(event) || !hasValue(regform) || !hasValue(participant)) {
              return;
            }

            await markAsUnpaid(event, regform, participant, errorModal);
          },
        },
      ]}
    />
  );
}

interface SectionProps extends Section {
  isFirst: boolean;
  isLast: boolean;
  isUnique: boolean;
}

function RegistrationSection(section: SectionProps) {
  const {title, fields, isFirst, isLast, isUnique} = section;
  const [isOpen, setIsOpen] = useState(false);

  let border = '';
  if (isFirst) {
    border += ' rounded-t-xl';
    if (!isUnique && !isOpen) {
      border += ' border-b-0';
    }
  }
  if (isLast && !isOpen) {
    border += ' rounded-b-xl';
  }
  if (isUnique && !isOpen) {
    border += ' rounded-b-xl';
  }

  let bgColor = '';
  if (isOpen) {
    bgColor += ' bg-blue-100 dark:bg-gray-700';
  } else {
    bgColor += ' bg-gray-100 dark:bg-gray-800';
  }

  let expandedBorder = '';
  if (isUnique || isLast) {
    expandedBorder += ' border-b rounded-b-xl';
  }

  return (
    <div>
      <div>
        <button
          type="button"
          disabled={fields.length === 0}
          className={`flex w-full items-center justify-between border border-gray-200 p-5 text-left
                      font-medium transition-all dark:border-gray-700 ${bgColor} ${border}`}
          onClick={() => setIsOpen(o => !o)}
        >
          <Typography variant="h4" className="flex w-full justify-between">
            {title}
            {isOpen && <ChevronDownIcon className="h-6 w-6" />}
            {!isOpen && <ChevronLeftIcon className="h-6 w-6" />}
          </Typography>
        </button>
      </div>
      <div className={isOpen ? '' : 'hidden'}>
        <div
          className={`flex flex-col gap-2 border-l border-r px-5 py-5 dark:border-gray-700 ${expandedBorder}`}
        >
          {fields.map(field => (
            <Field key={field.id} {...field} />
          ))}
        </div>
      </div>
    </div>
  );
}
