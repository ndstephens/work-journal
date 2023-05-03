import type { ActionArgs, V2_MetaFunction } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { format, parseISO, startOfWeek } from 'date-fns';
import { useEffect, useRef } from 'react';
import { db } from '~/utils/db.server';

export const meta: V2_MetaFunction = () => {
  return [{ title: 'Work Journal' }];
};

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const { date, type, text } = Object.fromEntries(formData);

  // await a set number of seconds to simulate a slow network
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (
    typeof date !== 'string' ||
    typeof type !== 'string' ||
    typeof text !== 'string'
  ) {
    throw new Response('Invalid form data', { status: 400 });
  }
  return db.entry.create({
    data: {
      date: new Date(date),
      type: type,
      text: text,
    },
  });
}

export async function loader() {
  const entries = await db.entry.findMany({
    orderBy: { date: 'desc' },
  });

  const entriesByWeek = entries.reduce<
    Record<string, Record<string, typeof entries>>
  >((acc, entry) => {
    const entryDateUTC = parseISO(entry.date.toISOString().substring(0, 10));
    const sunday = format(startOfWeek(entryDateUTC), 'yyyy-MM-dd');
    acc[sunday] ||= {};
    acc[sunday][entry.type] ||= [];
    acc[sunday][entry.type].push(entry);
    return acc;
  }, {});

  return Object.entries(entriesByWeek).map(([dateString, entries]) => {
    return {
      dateString,
      work: entries['work'] || [],
      learnings: entries['learning'] || [],
      interestingThings: entries['interesting-thing'] || [],
    };
  });
}

export default function Index() {
  const fetcher = useFetcher();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const weeks = useLoaderData<typeof loader>();

  useEffect(() => {
    if (fetcher.state === 'idle' && textAreaRef.current) {
      textAreaRef.current.value = '';
      textAreaRef.current.focus();
    }
  }, [fetcher.state]);

  return (
    <div className="p-10">
      <h1 className="text-5xl">Work Journal</h1>
      <p className="mt-2 text-lg text-gray-400">
        Learnings and doings. Updated weekly
      </p>

      {/* FORM */}
      <div className="my-8 border p-2">
        <p className="italic">Create an entry</p>
        <fetcher.Form method="post" className="mt-2">
          <fieldset
            className="disabled:opacity-70"
            disabled={fetcher.state === 'submitting'}
          >
            <div>
              <div>
                <input
                  type="date"
                  name="date"
                  required
                  className="text-gray-900"
                  defaultValue={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
              <div className="mt-4 space-x-4">
                <label>
                  <input
                    required
                    defaultChecked
                    className="mr-1 "
                    type="radio"
                    name="type"
                    value="work"
                  />
                  Work
                </label>
                <label>
                  <input
                    className="mr-1 "
                    type="radio"
                    name="type"
                    value="learning"
                  />
                  Learning
                </label>
                <label>
                  <input
                    className="mr-1 "
                    type="radio"
                    name="type"
                    value="interesting-thing"
                  />
                  Interesting thing
                </label>
              </div>
              <div className="mt-4">
                <textarea
                  ref={textAreaRef}
                  name="text"
                  className="w-full text-gray-700"
                  placeholder="Write you entry..."
                  required
                />
              </div>
              <div className="mt-1 text-right">
                <button
                  className="bg-blue-500 px-4 py-1 font-medium text-white"
                  type="submit"
                >
                  {fetcher.state === 'submitting' ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </fieldset>
        </fetcher.Form>
      </div>

      {/* ENTRIES */}
      <div className="mt-12 space-y-12">
        {weeks.map((week) => (
          <div key={week.dateString}>
            <p className="font-bold">
              Week of {format(parseISO(week.dateString), 'MMMM do')}
            </p>
            <div className="mt-3 space-y-4">
              {week.work.length > 0 && (
                <div>
                  <p>Work</p>
                  <ul className="ml-8 list-disc">
                    {week.work.map((entry) => (
                      <li key={entry.id}>{entry.text}</li>
                    ))}
                  </ul>
                </div>
              )}
              {week.learnings.length > 0 && (
                <div>
                  <p>Learnings</p>
                  <ul className="ml-8 list-disc">
                    {week.learnings.map((entry) => (
                      <li key={entry.id}>{entry.text}</li>
                    ))}
                  </ul>
                </div>
              )}
              {week.interestingThings.length > 0 && (
                <div>
                  <p>Interesting things</p>
                  <ul className="ml-8 list-disc">
                    {week.interestingThings.map((entry) => (
                      <li key={entry.id}>{entry.text}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
