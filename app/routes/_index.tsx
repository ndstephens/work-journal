import type { ActionArgs, V2_MetaFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { format } from 'date-fns';
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
  return entries;
}

export default function Index() {
  const fetcher = useFetcher();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const entries = useLoaderData<typeof loader>();

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

      {entries.map((entry) => (
        <p key={entry.id}>{entry.text}</p>
      ))}

      {/* ENTRIES */}
      {/* <div className="mt-4">
        <p className="font-bold">
          Week of May 1<sup>st</sup>
        </p>

        <div className="mt-3 space-y-4">
          <div>
            <p>Work</p>
            <ul className="ml-8 list-disc">
              <li>First item</li>
              <li>Second item</li>
            </ul>
          </div>
          <div>
            <p>Learnings</p>
            <ul className="ml-8 list-disc">
              <li>First item</li>
              <li>Second item</li>
            </ul>
          </div>
          <div>
            <p>Interesting things</p>
            <ul className="ml-8 list-disc">
              <li>First item</li>
              <li>Second item</li>
            </ul>
          </div>
        </div>
      </div> */}
    </div>
  );
}
