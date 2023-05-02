import type { ActionArgs, V2_MetaFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form } from '@remix-run/react';

export const meta: V2_MetaFunction = () => {
  return [{ title: 'Work Journal' }];
};

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  console.log(Object.fromEntries(formData));
  return redirect('/');
}

export default function Index() {
  return (
    <div className="p-10">
      <h1 className="text-5xl">Work Journal</h1>
      <p className="mt-2 text-lg text-gray-400">
        Learnings and doings. Updated weekly
      </p>

      <div className="my-8 border p-2">
        <Form method="post">
          <p className="italic">Create an entry</p>

          <div>
            <div className="mt-4">
              <input type="date" name="date" className="text-gray-700" />
            </div>

            <div className="mt-2 space-x-6">
              <label>
                <input
                  className="mr-1 "
                  type="radio"
                  name="category"
                  value="work"
                />
                Work
              </label>
              <label>
                <input
                  className="mr-1 "
                  type="radio"
                  name="category"
                  value="learning"
                />
                Learning
              </label>
              <label>
                <input
                  className="mr-1 "
                  type="radio"
                  name="category"
                  value="interesting-thing"
                />
                Interesting thing
              </label>
            </div>

            <div className="mt-2">
              <textarea
                name="text"
                className="w-full text-gray-700"
                placeholder="Write you entry..."
              />
            </div>

            <div className="mt-1 text-right">
              <button
                className="bg-blue-500 px-4 py-1 font-medium text-white"
                type="submit"
              >
                Save
              </button>
            </div>
          </div>
        </Form>
      </div>

      <div className="mt-4">
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
      </div>
    </div>
  );
}
